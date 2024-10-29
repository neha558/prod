import { BadRequestException, Injectable } from '@nestjs/common';
import { NFTAuction } from 'src/models/nftAuction.entity';
import { NFTAuctionBid } from 'src/models/nftAuctionBids.entity';
import { NFTOwnerRelation } from 'src/models/nftOwner.entity';
import { User } from 'src/models/user.entity';
import { getRepository, LessThanOrEqual, MoreThanOrEqual, Raw } from 'typeorm';
import { SaleService } from '../sale/sale.service';

@Injectable()
export class AuctionService {
  constructor(private saleService: SaleService) {}
  //   auctions
  async createAuction({ name, nftId, bid_increment_price, address }) {
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

    const nftAuction = await getRepository(NFTAuction).save({
      bid_increment_price,
      nft,
      name,
      created_by: currentOwner,
    });

    return nftAuction;
  }

  async createAuctionBid({ auctionId, bid, address }) {
    const now = new Date();
    const auction = await getRepository(NFTAuction).findOneOrFail({
      id: auctionId,
      start_date: LessThanOrEqual(now),
      end_date: MoreThanOrEqual(now),
    });

    const lastBid = await getRepository(NFTAuctionBid).findOne({
      where: { auction },
      order: {
        bid: 'DESC',
      },
    });

    const bidShouldBe = (lastBid?.bid ?? 0) + auction?.bid_increment_price;
    if (bid < bidShouldBe) {
      throw new BadRequestException(
        `Bid amount should be greater than or equals to last bid ${bidShouldBe}.`,
      );
    }

    const created_by = await getRepository(User).findOneOrFail({
      accountAddress: Raw(
        (alias) => `LOWER(${alias}) = '${String(address).toLowerCase()}'`,
      ),
    });
    const nftAuctionBid = await getRepository(NFTAuctionBid).save({
      auction,
      bid,
      created_by,
      isWinner: false,
    });
    return nftAuctionBid;
  }

  async setWinner({ auctionId, sell_tx }) {
    const auction = await getRepository(NFTAuction).findOneOrFail({
      where: {
        id: auctionId,
      },
      relations: ['nft', 'created_by'],
    });
    const highestBid = await getRepository(NFTAuctionBid).findOne({
      where: { auction },
      order: {
        bid: 'DESC',
      },
      relations: ['created_by'],
    });

    await getRepository(NFTAuctionBid).update(
      {
        winner_declared_on: new Date(),
        isWinner: true,
      },
      { id: highestBid?.id },
    );

    // call sale tx
    const saleEntry = await this.saleService.addOrUpdateCardForSale({
      nftId: auction?.nft?.id,
      newOwnerId: highestBid?.created_by?.id,
      price: highestBid?.bid,
      sold_on: new Date(),
      sell_tx,
      userId: auction?.created_by?.id,
      sold: true,
      type: 'auction',
      id: undefined,
    });

    return saleEntry;
  }

  async getAuctionDetails({ auctionId }) {
    const auction = await getRepository(NFTAuction).findOneOrFail({
      where: {
        id: auctionId,
      },
      relations: ['nft', 'created_by', 'bids', 'bids.created_by'],
    });

    return auction;
  }

  async getNFTOnAuction() {
    const now = new Date();

    const auction = await getRepository(NFTAuction).findAndCount({
      where: {
        start_date: LessThanOrEqual(now),
        end_date: MoreThanOrEqual(now),
      },
      order: {
        end_date: 'ASC',
      },
      relations: ['nft', 'created_by', 'bids', 'bids.created_by'],
    });

    return auction;
  }
}
