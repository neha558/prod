import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ResponseSuccess } from 'src/app/common/dto/response.dto';
import { IResponse } from 'src/app/common/interfaces/response.interface';
import { configService } from 'src/app/config/config.service';
import { NftsRentalService } from './nfts-rental.service';

@Controller('/api/v1/nfts-rental')
export class NftsRentalController {
  constructor(private nftsRentalService: NftsRentalService) {}
  @Post('/')
  async setNFTForPool(@Body() body, @Req() req): Promise<IResponse> {
    this.isValid(req?.headers);
    const response = await this.nftsRentalService.setNFTForPool(body);
    return new ResponseSuccess('Set NFT for rental pool', response);
  }

  @Get('/pool')
  async getNFTForPool(@Query() query, @Req() req): Promise<IResponse> {
    this.isValid(req?.headers);
    const response = await this.nftsRentalService.getNFTForPool(query);
    return new ResponseSuccess('Get NFT for rental pool', response);
  }

  @Get('/user-pool')
  async getNFTForPoolOfUser(@Query() query, @Req() req): Promise<IResponse> {
    this.isValid(req?.headers);
    const response = await this.nftsRentalService.getNFTForPoolOfUser(query);
    return new ResponseSuccess('Get NFT User pool for rental pool', response);
  }

  @Put('/')
  async updateNFTForPool(@Body() body, @Req() req): Promise<IResponse> {
    const response = await this.nftsRentalService.updateNFTForPool(body);
    this.isValid(req?.headers);

    return new ResponseSuccess('Updated NFT for rental pool', response);
  }

  isValid(headers) {
    if (
      headers?.['x-api-key'] &&
      headers?.['x-api-key'] === configService.getRentalAPICallKey()
    ) {
      return true;
    }

    throw new UnauthorizedException('Please provide auth key');
  }
}
