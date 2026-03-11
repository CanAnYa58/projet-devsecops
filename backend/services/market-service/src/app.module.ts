import { Module } from '@nestjs/common';
import { MarketController } from './controllers/market.controller';
import { YahooFinanceService } from './services/yahoo-finance.service';

@Module({
  controllers: [MarketController],
  providers: [YahooFinanceService],
})
export class AppModule {}
