import { Module } from '@nestjs/common';
import { SaleService } from '../sale/sale.service';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';

@Module({
  controllers: [OfferController],
  providers: [OfferService, SaleService],
})
export class OfferModule {}
