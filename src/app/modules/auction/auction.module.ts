import { Module } from '@nestjs/common';
import { SaleService } from '../sale/sale.service';
import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';

@Module({
  controllers: [AuctionController],
  providers: [AuctionService, SaleService],
})
export class AuctionModule {}
