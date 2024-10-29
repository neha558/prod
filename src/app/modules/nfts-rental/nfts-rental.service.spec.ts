import { Test, TestingModule } from '@nestjs/testing';
import { NftsRentalService } from './nfts-rental.service';

describe('NftsRentalService', () => {
  let service: NftsRentalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NftsRentalService],
    }).compile();

    service = module.get<NftsRentalService>(NftsRentalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
