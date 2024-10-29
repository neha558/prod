import { Test, TestingModule } from '@nestjs/testing';
import { NftsRentalController } from './nfts-rental.controller';

describe('NftsRentalController', () => {
  let controller: NftsRentalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NftsRentalController],
    }).compile();

    controller = module.get<NftsRentalController>(NftsRentalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
