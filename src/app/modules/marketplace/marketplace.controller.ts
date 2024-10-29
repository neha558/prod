import { Controller, Get, Param, Query } from '@nestjs/common';
import { ResponseSuccess } from 'src/app/common/dto/response.dto';
import { IResponse } from 'src/app/common/interfaces/response.interface';
import { MarketplaceService } from './marketplace.service';

@Controller('/api/v1/marketplace')
export class MarketplaceController {
  constructor(private marketplaceService: MarketplaceService) {}

  @Get('/:entity')
  async get(@Param() params, @Query() query): Promise<IResponse> {
    if (params.entity === 'nft-metadata-sync') {
      return await this.getNFTCategoryMetadata();
    }

    if (params.entity === 'nft-master') {
      return await this.getMarketplaceTeams();
    }

    const response = await this.marketplaceService.get(params?.entity, query);
    return new ResponseSuccess(`${params?.entity} : Get details`, response);
  }

  async getNFTCategoryMetadata(): Promise<IResponse> {
    const response = await this.marketplaceService.getNFTCategoryMetadata();
    return new ResponseSuccess(`NFT metadata sync`, response);
  }

  async getMarketplaceTeams(): Promise<IResponse> {
    const response = await this.marketplaceService.getMarketplaceTeams();
    return new ResponseSuccess(`NFT master data`, response);
  }
}
