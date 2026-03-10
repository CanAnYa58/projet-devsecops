import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo";
import { StockQuote } from "@/types";

const POPULAR_ETFS = [
  "SPY",   // SPDR S&P 500
  "QQQ",   // Invesco NASDAQ-100
  "VTI",   // Vanguard Total Stock Market
  "IVV",   // iShares Core S&P 500
  "VOO",   // Vanguard S&P 500
  "VEA",   // Vanguard Developed Markets
  "VWO",   // Vanguard Emerging Markets
  "AGG",   // iShares Core U.S. Aggregate Bond
  "BND",   // Vanguard Total Bond Market
  "GLD",   // SPDR Gold Shares
  "SLV",   // iShares Silver Trust
  "IAU",   // iShares Gold Trust
  "EEM",   // iShares MSCI Emerging Markets
  "XLK",   // Technology Select Sector SPDR
  "XLF",   // Financial Select Sector SPDR
  "XLE",   // Energy Select Sector SPDR
  "XLV",   // Health Care Select Sector SPDR
  "ARKK",  // ARK Innovation ETF
  "SCHD",  // Schwab US Dividend Equity
  "LQD",   // iShares Investment Grade Corporate Bond
];

export const maxDuration = 30;

export async function GET() {
  const results = await Promise.allSettled(
    POPULAR_ETFS.map(async (symbol) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const q: any = await yahooFinance.quote(symbol);
        return {
          symbol: q.symbol ?? symbol,
          name: q.longName || q.shortName || q.symbol || symbol,
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
        } as StockQuote;
      } catch {
        return null;
      }
    })
  );

  const etfs = results
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter(Boolean) as StockQuote[];

  return NextResponse.json(etfs, {
    headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
    },
  });
}
