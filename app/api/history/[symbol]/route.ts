import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo";
import { ChartPoint } from "@/types";

type Interval =
  | "1m"
  | "2m"
  | "5m"
  | "15m"
  | "30m"
  | "60m"
  | "90m"
  | "1h"
  | "1d"
  | "5d"
  | "1wk"
  | "1mo"
  | "3mo";

function getPeriodConfig(period: string): {
  period1: Date;
  interval: Interval;
  dateFormat: (d: Date) => string;
} {
  const now = new Date();

  const ms = (n: number, unit: "h" | "d" | "w" | "y") => {
    const m: Record<typeof unit, number> = {
      h: 3600000,
      d: 86400000,
      w: 604800000,
      y: 31536000000,
    };
    return n * m[unit];
  };

  const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
    d.toLocaleString("fr-FR", opts);

  switch (period) {
    case "1D":
      return {
        period1: new Date(Date.now() - ms(1, "d")),
        interval: "5m",
        dateFormat: (d) => fmt(d, { hour: "2-digit", minute: "2-digit" }),
      };
    case "1W":
      return {
        period1: new Date(Date.now() - ms(7, "d")),
        interval: "15m",
        dateFormat: (d) =>
          fmt(d, { weekday: "short", hour: "2-digit", minute: "2-digit" }),
      };
    case "1M":
      return {
        period1: new Date(Date.now() - ms(30, "d")),
        interval: "1d",
        dateFormat: (d) => fmt(d, { day: "2-digit", month: "short" }),
      };
    case "3M":
      return {
        period1: new Date(Date.now() - ms(90, "d")),
        interval: "1d",
        dateFormat: (d) => fmt(d, { day: "2-digit", month: "short" }),
      };
    case "6M":
      return {
        period1: new Date(Date.now() - ms(180, "d")),
        interval: "1d",
        dateFormat: (d) => fmt(d, { day: "2-digit", month: "short", year: "2-digit" }),
      };
    case "1Y":
      return {
        period1: new Date(Date.now() - ms(1, "y")),
        interval: "1d",
        dateFormat: (d) => fmt(d, { month: "short", year: "numeric" }),
      };
    case "5Y":
      return {
        period1: new Date(Date.now() - ms(5, "y")),
        interval: "1wk",
        dateFormat: (d) => fmt(d, { month: "short", year: "numeric" }),
      };
    default:
      return {
        period1: new Date(Date.now() - ms(30, "d")),
        interval: "1d",
        dateFormat: (d) => fmt(d, { day: "2-digit", month: "short" }),
      };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "1M";

  const { period1, interval, dateFormat } = getPeriodConfig(period);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await yahooFinance.chart(symbol, {
      period1,
      interval,
    });

    const quotes: Array<{
      date: Date | string;
      open: number | null;
      high: number | null;
      low: number | null;
      close: number | null;
      volume: number | null;
    }> = result.quotes ?? [];

    const data: ChartPoint[] = quotes
      .filter((q) => q.close != null)
      .map((q) => ({
        time: dateFormat(new Date(q.date)),
        price: Math.round((q.close ?? 0) * 100) / 100,
        open: q.open ?? undefined,
        high: q.high ?? undefined,
        low: q.low ?? undefined,
        volume: q.volume ?? undefined,
      }));

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": period === "1D"
          ? "s-maxage=60, stale-while-revalidate=120"
          : "s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error(`History API error for ${symbol}:`, error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
