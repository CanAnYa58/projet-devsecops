import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await yahooFinance.search(query, {
      newsCount: 0,
      quotesCount: 8,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quotes = ((result.quotes ?? []) as any[])
      .filter(
        (q) =>
          q.quoteType === "EQUITY" ||
          q.quoteType === "ETF" ||
          q.quoteType === "INDEX" ||
          q.quoteType === "MUTUALFUND"
      )
      .slice(0, 8)
      .map((q) => ({
        symbol: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        exchange: q.exchDisp || q.exchange || "",
        type: q.quoteType,
      }));

    return NextResponse.json(quotes, {
      headers: { "Cache-Control": "s-maxage=60" },
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
