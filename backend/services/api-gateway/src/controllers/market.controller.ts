import { Controller, Get, Query, Param } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller('api')
export class MarketController {
  private readonly marketServiceUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.marketServiceUrl = process.env.MARKET_SERVICE_URL || 'http://localhost:3002';
  }

  @Get('market')
  async getMarketData() {
    const response = await firstValueFrom(
      this.httpService.get(`${this.marketServiceUrl}/market`)
    );
    return response.data;
  }

  @Get('quote')
  async getQuote(@Query('symbols') symbols: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.marketServiceUrl}/quote`, {
        params: { symbols }
      })
    );
    return response.data;
  }

  @Get('search')
  async search(@Query('q') query: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.marketServiceUrl}/search`, {
        params: { q: query }
      })
    );
    return response.data;
  }

  @Get('history/:symbol')
  async getHistory(@Param('symbol') symbol: string, @Query('period1') period1?: string, @Query('period2') period2?: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.marketServiceUrl}/history/${symbol}`, {
          params: { period1, period2 }
        })
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch history for ${symbol}:`, error.response?.data || error.message);
      throw new Error(`Unable to fetch historical data for ${symbol}`);
    }
  }

  @Get('etfs')
  async getEtfs() {
    const response = await firstValueFrom(
      this.httpService.get(`${this.marketServiceUrl}/etfs`)
    );
    return response.data;
  }
}
