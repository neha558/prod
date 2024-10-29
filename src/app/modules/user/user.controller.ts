import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ResponseSuccess } from 'src/app/common/dto/response.dto';
import { IResponse } from 'src/app/common/interfaces/response.interface';
import { EmailSubscribeDTO } from 'src/app/dto/users/EmailSubscribeDTO';
import { UpdateProfileDTO } from 'src/app/dto/users/UpdateProfile.dto';
import { JwtAuthGuard } from './guard/JwtAuthGuard';
import { UserService } from './user.service';

export const storage = diskStorage({
  destination: './public/uploads',
  filename: (req, file, callback) => {
    callback(null, generateFilename(file));
  },
});

function generateFilename(file) {
  return `${Date.now()}_${Math.random()}${extname(file.originalname)}`;
}
@Controller('/api/v1/user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('/sync-nfts')
  async syncNFT(): Promise<IResponse> {
    const response = await this.userService.syncNFT();
    return new ResponseSuccess('Sync NFT', response);
  }

  @Get('/nfts')
  async nfts(@Query() query): Promise<IResponse> {
    const response = await this.userService.nfts(query);
    return new ResponseSuccess('NFTs', response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/fav-nfts')
  async favNfts(@Query() query, @Req() req): Promise<IResponse> {
    const response = await this.userService.favNfts(query, req?.user?.id);
    return new ResponseSuccess('Fav NFTs', response);
  }

  @Post('/register/:accountAddress')
  async register(@Param() params, @Body() body): Promise<IResponse> {
    const response = await this.userService.register(params, body);
    return new ResponseSuccess('User Details', response);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/toggle-fav')
  async toggleFav(@Body() body, @Req() req): Promise<IResponse> {
    const response = await this.userService.toggleFav(body, req?.user?.id);
    return new ResponseSuccess('NFT Fav', response);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/me')
  async updateProfile(
    @Body() body: UpdateProfileDTO,
    @Req() req,
  ): Promise<IResponse> {
    const response = await this.userService.updateProfile(body, req.user);
    return new ResponseSuccess('Update Profile', response);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is not attached.');
    }
    return new ResponseSuccess('File upload', {
      url: `${process.env.DOMAIN_NAME}/uploads/${file?.filename}`,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('/sync-my-nfts')
  async syncMyNFTs(@Req() req, @Body() body): Promise<IResponse> {
    const response = await this.userService.syncMyNFTs(req.user, body);
    return new ResponseSuccess('Sync My NFTs', response);
  }

  @Get('/details/:userName')
  async getUserDetails(@Param() params): Promise<IResponse> {
    const response = await this.userService.getUserDetails(params?.userName);
    return new ResponseSuccess('User Details', response);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/toggle-follow')
  async toggleFollow(@Body() body, @Req() req): Promise<IResponse> {
    const response = await this.userService.toggleFollow(body, req?.user?.id);
    return new ResponseSuccess('User follow', response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/followers/:userName')
  async getFollowers(@Param() params, @Query() query): Promise<IResponse> {
    const response = await this.userService.getFollowers(
      params?.userName,
      query?.userId,
    );
    return new ResponseSuccess('User followers', response);
  }

  @Post('/subscribe')
  async subscribe(@Body() body: EmailSubscribeDTO): Promise<IResponse> {
    const response = await this.userService.subscribe(body?.email);
    return new ResponseSuccess('Email subscribe', response);
  }

  @Get('/sync-nft-category-for-stacking')
  async fetchMetadataAndValidatedNFTsForStacking(): Promise<IResponse> {
    const response =
      await this.userService.fetchMetadataAndValidatedNFTsForStacking();
    return new ResponseSuccess('Fetched NFTs', response);
  }

  // // todo remove this path once init holding is done
  // @Get('/sync-nft-for-holding')
  // async getTransferredNFTs(): Promise<IResponse> {
  //   const response = await this.userService.getTransferredNFTs();
  //   return new ResponseSuccess('Sync done', response);
  // }

  @Get('/getNFTHoldingRewardsRecords/:accountAddress')
  async getNFTHoldingRewardsRecords(@Param() params): Promise<IResponse> {
    const response = await this.userService.getNFTHoldingRewardsRecords(
      params.accountAddress,
    );
    return new ResponseSuccess('Get NFT Holding Rewards', response);
  }

  @Get('/getNFTHoldingRewards/:accountAddress')
  async getNFTHoldingRewards(@Param() params): Promise<IResponse> {
    const response = await this.userService.getNFTHoldingRewards(
      params.accountAddress,
    );
    return new ResponseSuccess('Get NFT Holding Rewards', response);
  }

  @Get('/available-nfts')
  async getAvailableNFTs(@Query() query): Promise<IResponse> {
    const response = await this.userService.getAvailableNFTs(query);
    return new ResponseSuccess(`NFT available data`, response);
  }
}
