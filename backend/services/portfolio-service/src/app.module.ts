import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteController } from './controllers/favorite.controller';
import { PortfolioController } from './controllers/portfolio.controller';
import { Favorite } from './entities/favorite.entity';
import { PortfolioHolding } from './entities/portfolio-holding.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'stocktracker',
      entities: [Favorite, PortfolioHolding],
      synchronize: process.env.NODE_ENV !== 'production', // Disable in production
    }),
    TypeOrmModule.forFeature([Favorite, PortfolioHolding]),
  ],
  controllers: [FavoriteController, PortfolioController],
})
export class AppModule {}
