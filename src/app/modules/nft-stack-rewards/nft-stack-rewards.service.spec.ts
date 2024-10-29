import { Test, TestingModule } from '@nestjs/testing';
import { NftStackRewardsService } from './nft-stack-rewards.service';

describe('NftStackRewardsService', () => {
  let service: NftStackRewardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NftStackRewardsService],
    }).compile();

    service = module.get<NftStackRewardsService>(NftStackRewardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
