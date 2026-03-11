import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MarketController } from './controllers/market.controller';
import { PortfolioController } from './controllers/portfolio.controller';
import { HealthController } from './controllers/health.controller';

@Module({
  imports: [HttpModule],
  controllers: [MarketController, PortfolioController, HealthController],
})
export class AppModule {}
