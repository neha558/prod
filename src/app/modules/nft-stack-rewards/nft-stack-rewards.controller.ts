import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ResponseSuccess } from 'src/app/common/dto/response.dto';
import { IResponse } from 'src/app/common/interfaces/response.interface';
import { NftStackRewardsService } from './nft-stack-rewards.service';

@Controller('/api/v1/nft-stack-rewards')
export class NftStackRewardsController {
  constructor(private nftStackRewardsService: NftStackRewardsService) {}

  @Post('/stake')
  async stake(@Body() body): Promise<IResponse> {
    const response = await this.nftStackRewardsService.stake(
      body?.accountAddress,
    );
    return new ResponseSuccess('Stake', response);
  }

  @Post('/syncRewards')
  async syncRewards(@Body() body): Promise<IResponse> {
    const response = await this.nftStackRewardsService.syncRewards(
      body?.accountAddress,
    );
    return new ResponseSuccess('Sync rewards', response);
  }

  @Post('/claim')
  async claim(@Body() body, @Req() req): Promise<IResponse> {
    const response = await this.nftStackRewardsService.claim(
      body?.accountAddress,
      req.headers,
    );
    return new ResponseSuccess('Claim', response);
  }

  @Get('/staker/:accountAddress')
  async stackerDetails(@Param() params): Promise<IResponse> {
    const response = await this.nftStackRewardsService.stackerDetails(
      params?.accountAddress,
    );
    return new ResponseSuccess('Staker details', response);
  }
}
