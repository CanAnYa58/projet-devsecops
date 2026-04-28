import { Injectable } from '@nestjs/common';
import YahooFinance from 'yahoo-finance2';

export interface YahooQuoteResult {
  symbol?: string;
  longName?: string;
  shortName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
  marketCap?: number;
  regularMarketPreviousClose?: number;
  regularMarketOpen?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  currency?: string;
  fullExchangeName?: string;
  trailingPE?: number;
  dividendYield?: number;
  epsTrailingTwelveMonths?: number;
}

export interface YahooSearchQuoteResult {
  quoteType?: string;
  symbol?: string;
  longname?: string;
  shortname?: string;
  exchDisp?: string;
  exchange?: string;
}

export interface YahooSearchResult {
  quotes?: YahooSearchQuoteResult[];
}

export interface YahooHistoricalRow {
  date?: Date | string;
  close?: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
}

export type YahooHistoricalResult = YahooHistoricalRow[] | unknown;

export interface YahooHistoricalOptions {
  period1: Date;
  period2: Date;
  interval: string;
}

interface YahooFinanceClient {
  quote(symbol: string, options?: Record<string, unknown>): Promise<YahooQuoteResult>;
  search(query: string, options?: Record<string, unknown>): Promise<YahooSearchResult>;
  historical(symbol: string, options?: YahooHistoricalOptions): Promise<YahooHistoricalResult>;
  quoteSummary(symbol: string, options?: Record<string, unknown>): Promise<unknown>;
}

@Injectable()
export class YahooFinanceService {
  private yahooFinance: YahooFinanceClient;

  constructor() {
    this.yahooFinance = new YahooFinance({
      suppressNotices: ['yahooSurvey'],
    }) as unknown as YahooFinanceClient;
  }

  async quote(symbol: string, options?: Record<string, unknown>) {
    return this.yahooFinance.quote(symbol, options);
  }

  async search(query: string, options?: Record<string, unknown>) {
    return this.yahooFinance.search(query, options);
  }

  async historical(symbol: string, options?: YahooHistoricalOptions) {
    return this.yahooFinance.historical(symbol, options);
  }

  async quoteSummary(symbol: string, options?: Record<string, unknown>) {
    return this.yahooFinance.quoteSummary(symbol, options);
  }
}
