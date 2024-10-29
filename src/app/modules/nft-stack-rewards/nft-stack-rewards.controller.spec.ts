import { Test, TestingModule } from '@nestjs/testing';
import { NftStackRewardsController } from './nft-stack-rewards.controller';

describe('NftStackRewardsController', () => {
  let controller: NftStackRewardsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NftStackRewardsController],
    }).compile();

    controller = module.get<NftStackRewardsController>(NftStackRewardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
