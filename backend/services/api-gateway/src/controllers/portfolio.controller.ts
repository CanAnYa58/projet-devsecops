import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface PortfolioHoldingPayload {
  [key: string]: unknown;
}

@Controller('api')
export class PortfolioController {
  private readonly portfolioServiceUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.portfolioServiceUrl = process.env.PORTFOLIO_SERVICE_URL || 'http://localhost:3003';
  }

  // Favorites endpoints
  @Get('favorites')
  async getFavorites(@Query('userId') userId: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.portfolioServiceUrl}/favorites`, {
        params: { userId }
      })
    );
    return response.data;
  }

  @Post('favorites')
  async addFavorite(@Body() body: { userId: string; symbol: string }) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.portfolioServiceUrl}/favorites`, body)
    );
    return response.data;
  }

  @Delete('favorites/:symbol')
  async removeFavorite(@Param('symbol') symbol: string, @Query('userId') userId: string) {
    const response = await firstValueFrom(
      this.httpService.delete(`${this.portfolioServiceUrl}/favorites/${symbol}`, {
        params: { userId }
      })
    );
    return response.data;
  }

  // Portfolio endpoints
  @Get('portfolio')
  async getPortfolio(@Query('userId') userId: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.portfolioServiceUrl}/portfolio`, {
        params: { userId }
      })
    );
    return response.data;
  }

  @Post('portfolio')
  async addHolding(@Body() body: PortfolioHoldingPayload) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.portfolioServiceUrl}/portfolio`, body)
    );
    return response.data;
  }

  @Put('portfolio/:id')
  async updateHolding(@Param('id') id: string, @Body() body: PortfolioHoldingPayload) {
    const response = await firstValueFrom(
      this.httpService.put(`${this.portfolioServiceUrl}/portfolio/${id}`, body)
    );
    return response.data;
  }

  @Delete('portfolio/:id')
  async removeHolding(@Param('id') id: string, @Query('userId') userId: string) {
    const response = await firstValueFrom(
      this.httpService.delete(`${this.portfolioServiceUrl}/portfolio/${id}`, {
        params: { userId }
      })
    );
    return response.data;
  }
}
