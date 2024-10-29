import { Injectable } from '@nestjs/common';
import { NFTOffer } from 'src/models/nftOffer.entity';
import { NFTOfferEntries } from 'src/models/nftOfferEntries.entity';
import { NFTOwnerRelation } from 'src/models/nftOwner.entity';
import { User } from 'src/models/user.entity';
import { getRepository, Raw } from 'typeorm';
import { SaleService } from '../sale/sale.service';

@Injectable()
export class OfferService {
  constructor(private saleService: SaleService) {}

  //   offers
  async createOffer({ name, nftId, address }) {
    const currentOwner = await getRepository(User).findOneOrFail({
      accountAddress: Raw(
        (alias) => `LOWER(${alias}) = '${String(address).toLowerCase()}'`,
      ),
    });
    const nft = await getRepository(NFTOwnerRelation).findOneOrFail({
      where: {
        nftId,
        currentOwner,
      },
    });

    const nftOffer = await getRepository(NFTOffer).save({
      nft,
      name,
      created_by: currentOwner,
    });

    return nftOffer;
  }

  async createPrUpdateOfferEntry({
    offerId,
    address,
    accepted,
    toAddress,
    price,
    nftId,
    id,
    sell_tx,
  }) {
    const offer = await getRepository(NFTOffer).findOneOrFail({
      id: offerId,
    });

    const nft = await getRepository(NFTOwnerRelation).findOneOrFail({
      nftId: nftId,
    });

    const created_by = await getRepository(User).findOneOrFail({
      accountAddress: Raw(
        (alias) => `LOWER(${alias}) = '${String(address).toLowerCase()}'`,
      ),
    });

    const created_for = await getRepository(User).findOneOrFail({
      accountAddress: Raw(
        (alias) => `LOWER(${alias}) = '${String(toAddress).toLowerCase()}'`,
      ),
    });

    const savedOffer = await getRepository(NFTOfferEntries).save({
      id,
      accepted,
      offer,
      nft,
      price,
      created_by,
      created_for,
    });

    if (accepted) {
      // call sale tx
      await this.saleService.addOrUpdateCardForSale({
        nftId: offer?.nft?.id,
        newOwnerId: savedOffer?.created_by?.id,
        price: savedOffer?.price,
        sold_on: new Date(),
        sell_tx,
        userId: offer?.created_by?.id,
        sold: true,
        type: 'offer',
        id: undefined,
      });
    }

    return savedOffer;
  }

  async getOfferDetails({ offerId }) {
    const offer = await getRepository(NFTOffer).findOneOrFail({
      where: {
        id: offerId,
      },
      relations: [
        'nft',
        'created_by',
        'offers',
        'offers.created_by',
        'offers.created_for',
      ],
    });

    return offer;
  }

  async getNFTOnOffer() {
    const offers = await getRepository(NFTOffer).findAndCount({
      order: {
        createDateTime: 'DESC',
      },
      relations: [
        'nft',
        'created_by',
        'offers',
        'offers.created_by',
        'offers.created_for',
      ],
    });

    return offers;
  }
}
