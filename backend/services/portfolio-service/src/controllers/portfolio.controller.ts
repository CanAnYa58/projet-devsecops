import { Controller, Get, Post, Put, Delete, Query, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortfolioHolding } from '../entities/portfolio-holding.entity';

@Controller('portfolio')
export class PortfolioController {
  constructor(
    @InjectRepository(PortfolioHolding)
    private portfolioRepository: Repository<PortfolioHolding>,
  ) {}

  @Get()
  async getPortfolio(@Query('userId') userId: string) {
    if (!userId) {
      throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
    }

    return await this.portfolioRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  @Post()
  async addHolding(@Body() body: { userId: string; symbol: string; shares: number; averagePrice: number }) {
    const { userId, symbol, shares, averagePrice } = body;

    if (!userId || !symbol || shares === undefined || averagePrice === undefined) {
      throw new HttpException('userId, symbol, shares, and averagePrice are required', HttpStatus.BAD_REQUEST);
    }

    const holding = this.portfolioRepository.create({
      userId,
      symbol,
      shares,
      averagePrice,
    });

    await this.portfolioRepository.save(holding);
    return holding;
  }

  @Put(':id')
  async updateHolding(
    @Param('id') id: string,
    @Body() body: Partial<PortfolioHolding>,
  ) {
    const holding = await this.portfolioRepository.findOne({ where: { id } });

    if (!holding) {
      throw new HttpException('Holding not found', HttpStatus.NOT_FOUND);
    }

    // Update only provided fields
    if (body.shares !== undefined) holding.shares = body.shares;
    if (body.averagePrice !== undefined) holding.averagePrice = body.averagePrice;

    await this.portfolioRepository.save(holding);
    return holding;
  }

  @Delete(':id')
  async removeHolding(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ) {
    if (!userId) {
      throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
    }

    const result = await this.portfolioRepository.delete({ id, userId });

    if (result.affected === 0) {
      throw new HttpException('Holding not found', HttpStatus.NOT_FOUND);
    }

    return { message: 'Holding removed', id };
  }
}
