import { Module } from '@nestjs/common';
import { NftsRentalController } from './nfts-rental.controller';
import { NftsRentalService } from './nfts-rental.service';

@Module({
  controllers: [NftsRentalController],
  providers: [NftsRentalService]
})
export class NftsRentalModule {}
