import { Controller, Get, Post, Delete, Query, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../entities/favorite.entity';

@Controller('favorites')
export class FavoriteController {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  @Get()
  async getFavorites(@Query('userId') userId: string) {
    if (!userId) {
      throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
    }

    const favorites = await this.favoriteRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return favorites.map(f => f.symbol);
  }

  @Post()
  async addFavorite(@Body() body: { userId: string; symbol: string }) {
    const { userId, symbol } = body;

    if (!userId || !symbol) {
      throw new HttpException('userId and symbol are required', HttpStatus.BAD_REQUEST);
    }

    // Check if already exists
    const existing = await this.favoriteRepository.findOne({
      where: { userId, symbol },
    });

    if (existing) {
      return { message: 'Already in favorites' };
    }

    const favorite = this.favoriteRepository.create({ userId, symbol });
    await this.favoriteRepository.save(favorite);

    return { message: 'Added to favorites', symbol };
  }

  @Delete(':symbol')
  async removeFavorite(
    @Param('symbol') symbol: string,
    @Query('userId') userId: string,
  ) {
    if (!userId) {
      throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
    }

    const result = await this.favoriteRepository.delete({ userId, symbol });

    if (result.affected === 0) {
      throw new HttpException('Favorite not found', HttpStatus.NOT_FOUND);
    }

    return { message: 'Removed from favorites', symbol };
  }
}
