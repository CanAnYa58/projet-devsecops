export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  currency: string;
  exchange: string;
  trailingPE?: number;
  dividendYield?: number;
  eps?: number;
  sector?: string;
}

export interface ChartPoint {
  time: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
}

export interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
  currency: string;
}

export interface PortfolioHoldingWithValue extends PortfolioHolding {
  currentPrice: number;
  currentValue: number;
  totalCost: number;
  pnl: number;
  pnlPercent: number;
}

export type Period = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y';

export interface MarketIndex {
  symbol: string;
  name: string;
  quote: StockQuote;
}
