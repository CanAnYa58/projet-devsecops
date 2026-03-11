import { Injectable } from '@nestjs/common';

// yahoo-finance2 v3 requires instantiation with `new`
const YahooFinanceClass = require('yahoo-finance2').default;

@Injectable()
export class YahooFinanceService {
  private yahooFinance: any;

  constructor() {
    this.yahooFinance = new YahooFinanceClass({
      suppressNotices: ['yahooSurvey'],
    });
  }

  async quote(symbol: string, options?: any) {
    return this.yahooFinance.quote(symbol, options);
  }

  async search(query: string, options?: any) {
    return this.yahooFinance.search(query, options);
  }

  async historical(symbol: string, options?: any) {
    return this.yahooFinance.historical(symbol, options);
  }

  async quoteSummary(symbol: string, options?: any) {
    return this.yahooFinance.quoteSummary(symbol, options);
  }
}
