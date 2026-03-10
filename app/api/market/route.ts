import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo";
import { StockQuote } from "@/types";

const INDICES = [
  { symbol: "^GSPC", name: "S&P 500" },
  { symbol: "^IXIC", name: "NASDAQ" },
  { symbol: "^DJI", name: "Dow Jones" },
  { symbol: "^FCHI", name: "CAC 40" },
  { symbol: "^GDAXI", name: "DAX" },
  { symbol: "^FTSE", name: "FTSE 100" },
  { symbol: "^N225", name: "Nikkei 225" },
  { symbol: "^HSI", name: "Hang Seng" },
];

const POPULAR_STOCKS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA",
  "META", "TSLA", "BRK-B", "JPM", "V",
  "UNH", "LLY", "XOM", "JNJ", "WMT",
  "MA", "AVGO", "HD", "CVX", "MRK",
];

async function fetchQuote(symbol: string, fallbackName?: string): Promise<StockQuote | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q: any = await yahooFinance.quote(symbol);
    return {
      symbol: q.symbol ?? symbol,
      name: q.longName || q.shortName || fallbackName || q.symbol || symbol,
      price: q.regularMarketPrice ?? 0,
      change: q.regularMarketChange ?? 0,
      changePercent: q.regularMarketChangePercent ?? 0,
      volume: q.regularMarketVolume ?? 0,
      marketCap: q.marketCap,
      previousClose: q.regularMarketPreviousClose ?? 0,
      open: q.regularMarketOpen ?? 0,
      dayHigh: q.regularMarketDayHigh ?? 0,
      dayLow: q.regularMarketDayLow ?? 0,
      fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: q.fiftyTwoWeekLow,
      currency: q.currency ?? "USD",
      exchange: q.fullExchangeName ?? "",
    };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const [indicesResults, stocksResults] = await Promise.all([
      Promise.allSettled(
        INDICES.map((idx) => fetchQuote(idx.symbol, idx.name))
      ),
      Promise.allSettled(
        POPULAR_STOCKS.map((sym) => fetchQuote(sym))
      ),
    ]);

    const indices = indicesResults
      .map((r, i) =>
        r.status === "fulfilled" && r.value
          ? { symbol: INDICES[i].symbol, name: INDICES[i].name, quote: r.value }
          : null
      )
      .filter(Boolean);

    const popularStocks = stocksResults
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter(Boolean) as StockQuote[];

    const sorted = [...popularStocks].sort(
      (a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)
    );

    const gainers = sorted.filter((s) => s.changePercent > 0).slice(0, 5);
    const losers = sorted.filter((s) => s.changePercent < 0).slice(0, 5);

    return NextResponse.json(
      { indices, popularStocks, gainers, losers },
      {
        headers: {
          "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Market API error:", error);
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 });
  }
}
