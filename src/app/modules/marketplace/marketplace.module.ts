import { Module } from '@nestjs/common';
import { SmartContractService } from 'src/app/services/smart-contract/smart-contract.service';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';

@Module({
  controllers: [MarketplaceController],
  providers: [SmartContractService, MarketplaceService],
})
export class MarketplaceModule {}
