import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SmartContractService } from 'src/app/services/smart-contract/smart-contract.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { configService } from './../../config/config.service';
import { JwtStrategy } from './startegy/JWTStrategy';
import { MulterModule } from '@nestjs/platform-express';
import { MarketplaceService } from '../marketplace/marketplace.service';

@Module({
  imports: [
    JwtModule.register({
      secret: configService.getJWTSecret(),
      signOptions: { expiresIn: '1d' },
    }),
    MulterModule.register({
      dest: './public/uploads',
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    SmartContractService,
    JwtStrategy,
    MarketplaceService,
  ],
})
export class UserModule {}
