import { Module } from '@nestjs/common';
import { NftStackRewardsController } from './nft-stack-rewards.controller';
import { NftStackRewardsService } from './nft-stack-rewards.service';
import { SmartContractService } from 'src/app/services/smart-contract/smart-contract.service';
import { MarketplaceService } from '../marketplace/marketplace.service';

@Module({
  controllers: [NftStackRewardsController],
  providers: [NftStackRewardsService, SmartContractService, MarketplaceService],
})
export class NftStackRewardsModule {}
