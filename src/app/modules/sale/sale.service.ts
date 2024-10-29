import { Injectable } from '@nestjs/common';
import { PaginatedDTO } from 'src/app/common/dto/paginated.dto';
import { NFTOwnerRelation } from 'src/models/nftOwner.entity';
import { NFTSale } from 'src/models/nftSale.entity';
import { User } from 'src/models/user.entity';
import { getRepository } from 'typeorm';

@Injectable()
export class SaleService {
  // direct sales
  async getCardForSales(): Promise<PaginatedDTO> {
    const [records, total] = await getRepository(NFTSale).findAndCount({
      where: {
        sold: false,
      },
      relations: ['user', 'nft'],
    });

    return { records, total };
  }

  async getCardForSalesByCriteria(filter): Promise<PaginatedDTO> {
    const user = await getRepository(User).findOne({ id: filter?.user });
    const where: any = {
      sold: false,
    };

    if (user) {
      where.user = user;
    }

    if (filter?.type) {
      where.sell_type = filter?.type;
    }

    const [records, total] = await getRepository(NFTSale).findAndCount({
      where,
      relations: ['user', 'nft'],
    });

    return { records, total };
  }

  /**
   * To be called for
   * 1. To make card for sale from owner
   * 2. To Update the sale tx
   * 3. To make entry for the sale via auction
   * 4. To make entry for the sale via offer
   */
  async addOrUpdateCardForSale({
    nftId,
    price,
    type = 'direct',
    sold = false,
    sold_on,
    sell_tx = null,
    newOwnerId,
    userId,
    id,
  }) {
    const nft = await getRepository(NFTOwnerRelation).findOneOrFail({ nftId });
    const newOwner = await getRepository(User).findOne({ id: newOwnerId });
    const user = await getRepository(User).findOne({ id: userId });
    const sale_type: any = type;

    const savedOne = await getRepository(NFTSale).findOne({ id });
    const saved = await getRepository(NFTSale).save({
      id: savedOne?.id,
      nft,
      price,
      sell_type: sale_type,
      sold,
      sold_on,
      sell_tx,
      user,
      newOwner,
    });

    return saved;
  }
}
