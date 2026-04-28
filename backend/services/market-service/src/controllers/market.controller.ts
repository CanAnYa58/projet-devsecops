import { Controller, Get, Query, Param } from '@nestjs/common';
import {
  YahooFinanceService,
  type YahooHistoricalOptions,
  type YahooQuoteResult,
  type YahooSearchQuoteResult,
  type YahooSearchResult,
} from '../services/yahoo-finance.service';

interface StockQuote {
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
  epsTrailingTwelveMonths?: number;
}

function isStockQuote(value: StockQuote | null): value is StockQuote {
  return value !== null;
}

@Controller()
export class MarketController {
  private readonly INDICES = [
    { symbol: '^GSPC', name: 'S&P 500' },
    { symbol: '^IXIC', name: 'NASDAQ' },
    { symbol: '^DJI', name: 'Dow Jones' },
    { symbol: '^FCHI', name: 'CAC 40' },
    { symbol: '^GDAXI', name: 'DAX' },
    { symbol: '^FTSE', name: 'FTSE 100' },
    { symbol: '^N225', name: 'Nikkei 225' },
    { symbol: '^HSI', name: 'Hang Seng' },
  ];

  private readonly POPULAR_STOCKS = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA',
    'META', 'TSLA', 'BRK-B', 'JPM', 'V',
    'UNH', 'LLY', 'XOM', 'JNJ', 'WMT',
    'MA', 'AVGO', 'HD', 'CVX', 'MRK',
  ];

  private readonly POPULAR_ETFS = [
    'SPY', 'QQQ', 'VOO', 'VTI', 'IVV',
    'VEA', 'IEFA', 'AGG', 'BND', 'VWO',
  ];

  constructor(private readonly yahooFinanceService: YahooFinanceService) {}

  @Get('market')
  async getMarketData() {
    try {
      const indicesPromises = this.INDICES.map(({ symbol, name }) =>
        this.fetchQuote(symbol, name)
      );
      const stocksPromises = this.POPULAR_STOCKS.map((symbol) =>
        this.fetchQuote(symbol)
      );

      const [indicesRaw, stocksRaw] = await Promise.all([
        Promise.all(indicesPromises),
        Promise.all(stocksPromises),
      ]);

      const indices = indicesRaw.filter(Boolean).map((idx) => ({
        symbol: idx.symbol,
        name: idx.name,
        quote: idx,
      }));

      const stocks = stocksRaw.filter(isStockQuote);

      // Sort stocks by changePercent to get gainers and losers
      const sortedByChange = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
      
      const gainers = sortedByChange.filter(s => s.changePercent > 0).slice(0, 5);
      const losers = sortedByChange.filter(s => s.changePercent < 0).slice(-5).reverse();

      return {
        indices: indices,
        popularStocks: stocks,
        gainers: gainers,
        losers: losers,
      };
    } catch (error) {
      console.error('Market API error:', error);
      throw error;
    }
  }

  @Get('quote')
  async getQuote(@Query('symbols') symbolsParam: string) {
    if (!symbolsParam) {
      throw new Error('symbols parameter required');
    }

    const symbols = symbolsParam.split(',').map((s) => s.trim()).filter(Boolean);

    try {
      const results: PromiseSettledResult<YahooQuoteResult>[] = await Promise.allSettled(
        symbols.map((symbol) =>
          this.yahooFinanceService.quote(symbol, {
            fields: [
              'symbol', 'longName', 'shortName', 'regularMarketPrice',
              'regularMarketChange', 'regularMarketChangePercent',
              'regularMarketVolume', 'marketCap', 'regularMarketPreviousClose',
              'regularMarketOpen', 'regularMarketDayHigh', 'regularMarketDayLow',
              'fiftyTwoWeekHigh', 'fiftyTwoWeekLow', 'currency',
              'fullExchangeName', 'trailingPE', 'dividendYield', 'epsTrailingTwelveMonths',
            ],
          })
        )
      );

      const quotes: StockQuote[] = results
        .map((result, i) => {
          if (result.status === 'rejected') return null;
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
            currency: q.currency ?? 'USD',
            exchange: q.fullExchangeName ?? '',
            trailingPE: q.trailingPE,
            dividendYield: q.dividendYield,
            epsTrailingTwelveMonths: q.epsTrailingTwelveMonths,
          };
        })
        .filter(isStockQuote);

      return quotes;
    } catch (error) {
      console.error('Quote API error:', error);
      throw error;
    }
  }

  @Get('search')
  async search(@Query('q') query: string) {
    if (!query || query.length < 1) {
      return [];
    }

    try {
      const result: YahooSearchResult = await this.yahooFinanceService.search(query, {
        newsCount: 0,
        quotesCount: 8,
      });

      const quotes = (result.quotes ?? [])
        .filter(
          (q: YahooSearchQuoteResult) =>
            q.quoteType === 'EQUITY' ||
            q.quoteType === 'ETF' ||
            q.quoteType === 'INDEX' ||
            q.quoteType === 'MUTUALFUND'
        )
        .slice(0, 8)
        .map((q) => ({
          symbol: q.symbol,
          name: q.longname || q.shortname || q.symbol,
          exchange: q.exchDisp || q.exchange || '',
          type: q.quoteType,
        }));

      return quotes;
    } catch (error) {
      console.error('Search API error:', error);
      throw error;
    }
  }

  @Get('history/:symbol')
  async getHistory(
    @Param('symbol') symbol: string,
    @Query('period1') period1?: string,
    @Query('period2') period2?: string,
    @Query('interval') interval?: string
  ) {
    try {
      let startDate: Date;
      let endDate: Date;
      
      if (period1) {
        startDate = new Date(period1);
      } else {
        // Default to 6 months ago
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        startDate = sixMonthsAgo;
      }

      if (period2) {
        endDate = new Date(period2);
      } else {
        // Default to today
        endDate = new Date();
      }

      // Ensure dates are valid
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date parameters');
      }

      const options: YahooHistoricalOptions = {
        period1: startDate,
        period2: endDate,
        interval: interval || '1d', // Default to daily data
      };

      const history = await this.yahooFinanceService.historical(symbol, options);
      
      // Transform the response to a more frontend-friendly format
      if (Array.isArray(history)) {
        return history.map(item => ({
          date: item.date?.toISOString?.() || item.date,
          price: item.close || 0,
          open: item.open,
          high: item.high,
          low: item.low,
          volume: item.volume,
        }));
      }
      
      return history;
    } catch (error) {
      console.error('History API error for symbol', symbol, ':', error);
      throw new Error(`Failed to fetch historical data for ${symbol}: ${error.message}`);
    }
  }

  @Get('etfs')
  async getEtfs() {
    try {
      const etfsPromises = this.POPULAR_ETFS.map((symbol) =>
        this.fetchQuote(symbol)
      );
      const etfs = await Promise.all(etfsPromises);
      return etfs.filter(Boolean);
    } catch (error) {
      console.error('ETFs API error:', error);
      throw error;
    }
  }

  private async fetchQuote(symbol: string, fallbackName?: string): Promise<StockQuote | null> {
    try {
      const q: YahooQuoteResult = await this.yahooFinanceService.quote(symbol);
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
        currency: q.currency ?? 'USD',
        exchange: q.fullExchangeName ?? '',
      };
    } catch {
      return null;
    }
  }
}
