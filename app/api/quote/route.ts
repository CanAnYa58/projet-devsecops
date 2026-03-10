import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo";
import { StockQuote } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get("symbols");

  if (!symbolsParam) {
    return NextResponse.json({ error: "symbols parameter required" }, { status: 400 });
  }

  const symbols = symbolsParam.split(",").map((s) => s.trim()).filter(Boolean);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: PromiseSettledResult<any>[] = await Promise.allSettled(
      symbols.map((symbol) =>
        yahooFinance.quote(symbol, {
          fields: [
            "symbol", "longName", "shortName", "regularMarketPrice",
            "regularMarketChange", "regularMarketChangePercent",
            "regularMarketVolume", "marketCap", "regularMarketPreviousClose",
            "regularMarketOpen", "regularMarketDayHigh", "regularMarketDayLow",
            "fiftyTwoWeekHigh", "fiftyTwoWeekLow", "currency",
            "fullExchangeName", "trailingPE", "dividendYield", "epsTrailingTwelveMonths",
          ],
        })
      )
    );

    const quotes: StockQuote[] = results
      .map((result, i) => {
        if (result.status === "rejected") return null;
        const q = result.value;
        return {
          symbol: q.symbol ?? symbols[i],
          name: q.longName || q.shortName || q.symbol || symbols[i],
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
          trailingPE: q.trailingPE,
          dividendYield: q.dividendYield,
          eps: q.epsTrailingTwelveMonths,
        } as StockQuote;
      })
      .filter(Boolean) as StockQuote[];

    return NextResponse.json(quotes, {
      headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" },
    });
  } catch (error) {
    console.error("Quote API error:", error);
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
  }
}
