import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configService } from './app/config/config.service';
import { AuctionModule } from './app/modules/auction/auction.module';
import { OfferModule } from './app/modules/offer/offer.module';
import { SaleModule } from './app/modules/sale/sale.module';
import { UserModule } from './app/modules/user/user.module';
import { SmartContractService } from './app/services/smart-contract/smart-contract.service';
import { MarketplaceModule } from './app/modules/marketplace/marketplace.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MarketplaceService } from './app/modules/marketplace/marketplace.service';
import { NftsRentalModule } from './app/modules/nfts-rental/nfts-rental.module';
import { NftStackRewardsModule } from './app/modules/nft-stack-rewards/nft-stack-rewards.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveStaticOptions: {
        index: false,
      },
    }),
    TypeOrmModule.forRoot(configService.getTypeOrmConfig('run')),
    ScheduleModule.forRoot(),
    AuctionModule,
    OfferModule,
    SaleModule,
    UserModule,
    MarketplaceModule,
    NftsRentalModule,
    NftStackRewardsModule,
  ],
  controllers: [AppController],
  providers: [AppService, SmartContractService, MarketplaceService],
})
export class AppModule {}
