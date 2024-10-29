import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import moment from 'moment';
import {
  categoryMapForStaking,
  contractNFT,
  web3,
} from 'src/app/config/web3.constants';
import { Config } from 'src/models/config.entity';
import { MarketplaceNftAuctionBidsRecords } from 'src/models/marketplaceNftAuctionBidsRecords.entity';
import { MarketplaceNftOffersRecords } from 'src/models/marketplaceNftOffersRecords.entity';
import { MarketplaceNftRentRecords } from 'src/models/marketplaceNftRentRecords.entity';
import { MarketPlace } from 'src/models/marketplaceRecords.entity';
import { MarketPlaceTransactionHistory } from 'src/models/marketplaceTransactionHistory.entity';
import { NFTOwnerRelation } from 'src/models/nftOwner.entity';
import { NFTStacked } from 'src/models/nftStacked.entity';
import { NFTRewardsClaims } from 'src/models/nftRewardsClaims.entity';
import { NFTStackedValidated } from 'src/models/nftStackedValidated.entity';
import { NFTHoldingRewardsRecords } from 'src/models/nftHoldingRewardsTx.entity';
import { User } from 'src/models/user.entity';
import { getRepository, In, Like, Raw } from 'typeorm';

const entityMap = {
  MarketPlace,
  MarketplaceNftAuctionBidsRecords,
  MarketplaceNftOffersRecords,
  MarketPlaceTransactionHistory,
  NFTStacked,
  Config,
  NFTStackedValidated,
  NFTRewardsClaims,
  NFTHoldingRewardsRecords,
};

@Injectable()
export class MarketplaceService {
  marketPlaceNFTStatus = {
    NOT_ON_SALE: 0,
    ON_SALE: 1,
    ON_AUCTION: 2,
    ON_RENT: 3,
    REMOVED: 4,
  };

  getHistoryMessage(typeOfSale: number, creator: User) {
    if (typeOfSale === this.marketPlaceNFTStatus.ON_SALE) {
      return `${creator?.userName} has put on sale`;
    }
    if (typeOfSale === this.marketPlaceNFTStatus.ON_AUCTION) {
      return `${creator?.userName} has put on auction`;
    }
    if (typeOfSale === this.marketPlaceNFTStatus.ON_RENT) {
      return `${creator?.userName} has put on rent`;
    }
    if (typeOfSale === this.marketPlaceNFTStatus.REMOVED) {
      return `${creator?.userName} has removed from marketplace`;
    }
  }

  async setMarketplaceRecords(data: any) {
    if (!Array.isArray(data)) {
      return null;
    }

    if (data?.length <= 0) {
      return null;
    }

    const nfts = await getRepository(NFTOwnerRelation).find({
      where: {
        nftId: In(data?.map((d) => parseInt(d?.data?.tokenId, 10))),
      },
    });

    const allAddress = data
      ?.map((d) => `'${String(d?.data?.owner).toLowerCase()}'`)
      .join(',');

    const users = await getRepository(User).find({
      where: {
        accountAddress: Raw((alias) => `LOWER(${alias}) IN (${allAddress})`),
      },
    });

    const formatedData: any = data?.map((d) => {
      const nftDetails = nfts?.find(
        (n) => String(n?.nftId) === String(d?.data?.tokenId),
      );
      const ownerUser = users?.find(
        (u) =>
          String(u?.accountAddress).toLowerCase() ===
          String(d?.data?.owner).toLowerCase(),
      );

      const price = web3.utils.fromWei(d?.data?.price?.toString(), 'ether');

      return {
        _id: parseInt(d?.data?.id, 10),
        auctionEnds: this.marketPlaceNFTStatus.ON_AUCTION
          ? parseInt(d?.data?.auctionEnds, 10)
          : 9999999999999,
        auctionStarts: this.marketPlaceNFTStatus.ON_AUCTION
          ? parseInt(d?.data?.auctionStarts, 10)
          : 9999999999999,
        isUSDT: d?.data?.isUSDT,
        owner: d?.data?.owner,
        ownerUser: ownerUser,
        tokenId: parseInt(d?.data?.tokenId, 10),
        nftDetails: nftDetails,
        perDayRent: web3.utils.fromWei(
          d?.data?.perDayRent?.toString(),
          'ether',
        ),
        price: parseFloat(price),
        txHash: d?.transaction_hash,
        typeOfSale: parseInt(d?.data?.typeOfSale, 10),
        internalComment: d?.data?.time ? String(d?.data?.time) : '',
      };
    });

    console.log({ formatedData });

    const saved: MarketPlace[] = await getRepository(MarketPlace).save(
      formatedData.filter((f) => {
        return f?.typeOfSale !== this.marketPlaceNFTStatus.REMOVED;
      }),
    );

    await getRepository(MarketPlace).update(
      {
        _id: In(
          formatedData
            .filter((f) => {
              return f?.typeOfSale === this.marketPlaceNFTStatus.REMOVED;
            })
            .map((d) => d?._id),
        ),
      },
      {
        isActive: false,
        typeOfSale: this.marketPlaceNFTStatus.REMOVED,
      },
    );

    // inactive existing one if Removed called

    // add entries for history
    const historyData = saved?.map((d) => {
      return {
        _id: d?._id,
        description: this.getHistoryMessage(d?.typeOfSale, d?.ownerUser),
        tokenId: d?.tokenId,
        price: d?.price,
        txHash: d?.txHash,
        typeOfSale: d?.typeOfSale,
        performedOn: d?.internalComment
          ? parseInt(d?.internalComment, 10)
          : new Date().getTime(),
      };
    });

    console.log({ historyData });

    await this.addEntryInTransactionHistory(historyData);
  }

  async setMarketplaceBids(data: any) {
    if (!Array.isArray(data)) {
      return null;
    }

    if (data?.length <= 0) {
      return null;
    }

    const allAddress = data
      ?.map((d) => `'${String(d?.data?.bidder).toLowerCase()}'`)
      .join(',');

    const users = await getRepository(User).find({
      where: {
        accountAddress: Raw((alias) => `LOWER(${alias}) IN (${allAddress})`),
      },
    });

    const marketplace = await getRepository(MarketPlace).find();

    const formatedData = data?.map((d) => {
      const price = web3.utils.fromWei(d?.data?.price?.toString(), 'ether');

      const bidderUser = users?.find(
        (u) =>
          String(u?.accountAddress).toLowerCase() ===
          String(d?.data?.bidder).toLowerCase(),
      );
      return {
        _id: parseInt(d?.data?.marketPlaceId, 10),
        bidder: d?.data?.bidder,
        bidderUser: bidderUser,
        price: parseFloat(price),
        isWinner: false,
        status: 'success',
        txHash: d?.transaction_hash,
        internalComment: d?.data?.time ? String(d?.data?.time) : '',
      };
    });

    const saved = await getRepository(MarketplaceNftAuctionBidsRecords).save(
      formatedData,
    );

    const updateLastBidPromises = saved?.map((s) => {
      return getRepository(MarketPlace).update(
        { _id: s?._id },
        {
          lastBid: s?.price,
        },
      );
    });
    await Promise.all(updateLastBidPromises);

    // add entries for history
    const historyData = data?.map((d) => {
      const price = web3.utils.fromWei(d?.data?.price?.toString(), 'ether');

      const marketplaceNFT = marketplace?.find(
        (_d) => String(_d?._id) === String(d?.data?.marketPlaceId),
      );
      const bidderUser = users?.find(
        (u) =>
          String(u?.accountAddress).toLowerCase() ===
          String(d?.data?.bidder).toLowerCase(),
      );
      return {
        _id: parseInt(d?.data?.marketPlaceId, 10),
        description: `${bidderUser?.userName} has put bid of ${price} ${
          marketplaceNFT?.isUSDT ? 'USDC' : 'CUBIX'
        }`,
        tokenId: d?.data?.tokenId,
        price: parseFloat(price),
        txHash: d?.transaction_hash,
        typeOfSale: this.marketPlaceNFTStatus.ON_AUCTION,
        performedOn: d?.data?.time
          ? parseInt(d?.data?.time, 10)
          : new Date().getTime(),
      };
    });
    await this.addEntryInTransactionHistory(historyData);
  }

  async setMarketplaceAcceptedOffers(data: any) {
    if (!Array.isArray(data)) {
      return null;
    }

    if (data?.length <= 0) {
      return null;
    }

    const allAddress = data
      ?.map((d) => `'${String(d?.data?.buyer).toLowerCase()}'`)
      .join(',');

    const users = await getRepository(User).find({
      where: {
        accountAddress: Raw((alias) => `LOWER(${alias}) IN (${allAddress})`),
      },
    });
    const marketplace = await getRepository(MarketPlace).find();

    for (const d of data) {
      const buyerUser = users?.find(
        (u) =>
          String(u?.accountAddress).toLowerCase() ===
          String(d?.data?.buyer).toLowerCase(),
      );
      const price = web3.utils.fromWei(d?.data?.price?.toString(), 'ether');

      await getRepository(MarketplaceNftOffersRecords).update(
        {
          _id: parseInt(d?.data?.marketPlaceId, 10),
          buyerUser: buyerUser,
          price,
        },
        { isAccepted: true },
      );
      await getRepository(NFTOwnerRelation).update(
        {
          nftId: parseInt(d?.data?.tokenId, 10),
        },
        { user: buyerUser, currentOwner: d?.data?.buyer },
      );
    }

    // add entries for history
    const historyData = data?.map((d) => {
      const price = web3.utils.fromWei(d?.data?.price?.toString(), 'ether');
      const marketplaceNFT = marketplace?.find(
        (_d) => String(_d?._id) === String(d?.data?.marketPlaceId),
      );
      const buyerUser = users?.find(
        (u) =>
          String(u?.accountAddress).toLowerCase() ===
          String(d?.data?.buyer).toLowerCase(),
      );
      return {
        _id: parseInt(d?.data?.marketPlaceId, 10),
        description: `Offer of ${
          buyerUser?.userName
        } has been accepted of price ${price} ${
          marketplaceNFT?.isUSDT ? 'USDC' : 'CUBIX'
        }`,
        tokenId: marketplaceNFT?.tokenId,
        price: parseFloat(price),
        txHash: d?.transaction_hash,
        typeOfSale: this.marketPlaceNFTStatus.ON_SALE,
        performedOn: d?.data?.time
          ? parseInt(d?.data?.time, 10)
          : new Date().getTime(),
      };
    });
    await this.addEntryInTransactionHistory(historyData);
  }

  async setMarketplaceOffersRecords(data: any) {
    if (!Array.isArray(data)) {
      return null;
    }

    if (data?.length <= 0) {
      return null;
    }

    const allAddress = data
      ?.map((d) => `'${String(d?.data?.buyer).toLowerCase()}'`)
      .join(',');

    const users = await getRepository(User).find({
      where: {
        accountAddress: Raw((alias) => `LOWER(${alias}) IN (${allAddress})`),
      },
    });

    const marketplace = await getRepository(MarketPlace).find();

    for (let index = 0; index < data.length; index++) {
      const d = data[index];
      const buyerUser = users?.find(
        (u) =>
          String(u?.accountAddress).toLowerCase() ===
          String(d?.data?.buyer).toLowerCase(),
      );

      const exists = await getRepository(MarketplaceNftOffersRecords).findOne({
        _id: parseInt(d?.data?.marketPlaceId, 10),
        buyerUser: buyerUser,
      });

      let id;
      const price = web3.utils.fromWei(d?.data?.price?.toString(), 'ether');
      if (exists?.price <= price) {
        id = exists?.id;
      }

      const formatedData = {
        id,
        _id: parseInt(d?.data?.marketPlaceId, 10),
        buyer: d?.data?.buyer,
        buyerUser: buyerUser,
        price: parseFloat(price),
        isAccepted: false,
        status: 'success',
        txHash: d?.transaction_hash,
        internalComment: d?.data?.time ? String(d?.data?.time) : '',
      };

      await getRepository(MarketplaceNftOffersRecords).save(formatedData);
    }

    // add entries for history
    const historyData = data?.map((d) => {
      const price = web3.utils.fromWei(d?.data?.price?.toString(), 'ether');

      const marketplaceNFT = marketplace?.find(
        (_d) => String(_d?._id) === String(d?.data?.marketPlaceId),
      );
      const buyerUser = users?.find(
        (u) =>
          String(u?.accountAddress).toLowerCase() ===
          String(d?.data?.buyer).toLowerCase(),
      );
      return {
        _id: parseInt(d?.data?.marketPlaceId, 10),
        description: ` ${buyerUser?.userName} has put offer of price ${price} ${
          marketplaceNFT?.isUSDT ? 'USDC' : 'CUBIX'
        }`,
        tokenId: marketplaceNFT?.tokenId,
        price: parseFloat(price),
        txHash: d?.transaction_hash,
        typeOfSale: this.marketPlaceNFTStatus.ON_SALE,
        performedOn: d?.data?.time
          ? parseInt(d?.data?.time, 10)
          : new Date().getTime(),
      };
    });
    await this.addEntryInTransactionHistory(historyData);
  }

  async setMarketplaceBuyNFTRecords(data: any) {
    if (!Array.isArray(data)) {
      return null;
    }

    if (data?.length <= 0) {
      return null;
    }

    const allAddress = data
      ?.map((d) => `'${String(d?.data?.buyer).toLowerCase()}'`)
      .join(',');

    const users = await getRepository(User).find({
      where: {
        accountAddress: Raw((alias) => `LOWER(${alias}) IN (${allAddress})`),
      },
    });
    const marketplace = await getRepository(MarketPlace).find({
      order: {
        createDateTime: 'DESC',
      },
    });

    for (const d of data) {
      const currentOwner: User = users?.find(
        (u) =>
          String(u?.accountAddress).toLowerCase() ===
          String(d?.data?.buyer).toLowerCase(),
      );
      await getRepository(NFTOwnerRelation).update(
        {
          nftId: parseInt(d?.data?.tokenId, 10),
        },
        { user: currentOwner, currentOwner: d?.data?.buyer },
      );
    }

    // add entries for history
    const historyData = data?.map((d) => {
      const price = web3.utils.fromWei(d?.data?.price?.toString(), 'ether');
      const marketplaceNFT = marketplace?.find(
        (_d) => String(_d?.tokenId) === String(d?.data?.tokenId),
      );
      const buyerUser: User = users?.find(
        (u) =>
          String(u?.accountAddress).toLowerCase() ===
          String(d?.data?.buyer).toLowerCase(),
      );
      return {
        _id: marketplaceNFT?._id ?? 0,
        description: ` ${
          buyerUser?.userName
        } has bough NFT for price ${price} ${
          marketplaceNFT?.isUSDT ? 'USDC' : 'CUBIX'
        }`,
        tokenId: d?.data?.tokenId,
        price: parseFloat(price),
        txHash: d?.transaction_hash,
        typeOfSale: this.marketPlaceNFTStatus.ON_SALE,
        performedOn: d?.data?.time
          ? parseInt(d?.data?.time, 10)
          : new Date().getTime(),
      };
    });
    await this.addEntryInTransactionHistory(historyData);
  }

  async setMarketplaceAuctionWinner(data: any) {
    if (!Array.isArray(data)) {
      return null;
    }

    if (data?.length <= 0) {
      return null;
    }

    const allAddress = data
      ?.map((d) => `'${String(d?.data?.winner).toLowerCase()}'`)
      .join(',');

    const users = await getRepository(User).find({
      where: {
        accountAddress: Raw((alias) => `LOWER(${alias}) IN (${allAddress})`),
      },
    });
    const marketplace = await getRepository(MarketPlace).find();

    for (const d of data) {
      const winnerUser = users?.find(
        (u) =>
          String(u?.accountAddress).toLowerCase() ===
          String(d?.data?.winner).toLowerCase(),
      );
      await getRepository(MarketplaceNftAuctionBidsRecords).update(
        {
          _id: parseInt(d?.data?.marketPlaceId, 10),
          bidderUser: winnerUser,
        },
        { isWinner: true },
      );
    }

    // add entries for history
    const historyData = data?.map((d) => {
      const price = web3.utils.fromWei(d?.data?.price?.toString(), 'ether');

      const marketplaceNFT = marketplace?.find(
        (_d) => String(_d?._id) === String(d?.data?.marketPlaceId),
      );
      const winnerUser = users?.find(
        (u) =>
          String(u?.accountAddress).toLowerCase() ===
          String(d?.data?.winner).toLowerCase(),
      );
      return {
        _id: parseInt(d?.data?.marketPlaceId, 10),
        description: `${
          winnerUser?.userName
        } has win NFT in auction for  price ${price} ${
          marketplaceNFT?.isUSDT ? 'USDC' : 'CUBIX'
        }`,
        tokenId: d?.data?.tokenId,
        price: parseFloat(price),
        txHash: d?.transaction_hash,
        typeOfSale: this.marketPlaceNFTStatus.ON_AUCTION,
        performedOn: d?.data?.time
          ? parseInt(d?.data?.time, 10)
          : new Date().getTime(),
      };
    });
    await this.addEntryInTransactionHistory(historyData);
  }

  async setMarketplaceRentedNFTRecords(data: any) {
    if (!Array.isArray(data)) {
      return null;
    }

    if (data?.length <= 0) {
      return null;
    }

    const allAddress = data
      ?.map((d) => `'${String(d?.data?.rental).toLowerCase()}'`)
      .join(',');

    const users = await getRepository(User).find({
      where: {
        accountAddress: Raw((alias) => `LOWER(${alias}) IN (${allAddress})`),
      },
    });
    const marketplace = await getRepository(MarketPlace).find();

    const formatedData = data?.map((d) => {
      const price = web3.utils.fromWei(d?.data?.price?.toString(), 'ether');

      const rentalUser = users?.find(
        (u) =>
          String(u?.accountAddress).toLowerCase() ===
          String(d?.data?.rental).toLowerCase(),
      );
      return {
        _id: parseInt(d?.data?.marketPlaceId, 10),
        rental: d?.data?.rental,
        rentalUser: rentalUser,
        price: parseFloat(price),
        starts: parseInt(d?.data?.starts, 10),
        ends: parseInt(d?.data?.ends, 10),
        status: 'success',
        txHash: d?.transaction_hash,
        internalComment: d?.data?.time ? String(d?.data?.time) : '',
      };
    });

    await getRepository(MarketplaceNftRentRecords).save(formatedData);

    // add entries for history
    const historyData = data?.map((d) => {
      const price = web3.utils.fromWei(d?.data?.price?.toString(), 'ether');

      const marketplaceNFT = marketplace?.find(
        (_d) => String(_d?._id) === String(d?.data?.marketPlaceId),
      );
      const buyerUser: User = users?.find(
        (u) =>
          String(u?.accountAddress).toLowerCase() ===
          String(d?.data?.rental).toLowerCase(),
      );
      return {
        _id: parseInt(d?.data?.marketPlaceId, 10),
        description: ` ${
          buyerUser?.userName
        } has rented NFT for price ${price} ${
          marketplaceNFT?.isUSDT ? 'USDC' : 'CUBIX'
        } from ${moment(parseInt(d?.data?.starts, 10) * 1000).format(
          'DD-MM-YYYY HH:mm a',
        )} to  ${moment(parseInt(d?.data?.ends, 10) * 1000).format(
          'DD-MM-YYYY HH:mm a',
        )} `,
        tokenId: marketplaceNFT?.tokenId,
        price: parseFloat(price),
        txHash: d?.transaction_hash,
        typeOfSale: this.marketPlaceNFTStatus.ON_RENT,
        performedOn: d?.data?.time
          ? parseInt(d?.data?.time, 10)
          : new Date().getTime(),
      };
    });
    await this.addEntryInTransactionHistory(historyData);
  }

  async get(entity: string, query: any): Promise<any> {
    if (!entityMap?.[entity]) {
      throw new BadRequestException('Not found what you are looking for');
    }
    const criteria = entityMap?.[entity];

    if (query?.activeMarketplace && entity === 'MarketPlace') {
      criteria.where = criteria.where ?? {};
      criteria.where['typeOfSale'] = In([
        this.marketPlaceNFTStatus.ON_SALE,
        this.marketPlaceNFTStatus.ON_AUCTION,
        this.marketPlaceNFTStatus.ON_RENT,
      ]);
    }

    if (query?.keyword) {
      criteria.where[query?.keyword?.key] = Like(`%${query?.keyword?.value}%`);
    }

    const [records, total] = await getRepository(criteria).findAndCount(query);

    return {
      records,
      query,
      total,
    };
  }

  async addEntryInTransactionHistory(historyData: any[]) {
    try {
      await getRepository(MarketPlaceTransactionHistory).save(historyData);
    } catch (error) {
      console.log('Error in save tx: ', error);
    }
  }

  async setNFTStackedRecords(data: any) {
    if (!Array.isArray(data)) {
      return null;
    }

    if (data?.length <= 0) {
      return null;
    }

    const nfts = await getRepository(NFTOwnerRelation).find({
      where: {
        nftId: In(data?.map((d) => parseInt(d?.data?.tokenId, 10))),
      },
    });

    const allAddress = data
      ?.map((d) => `'${String(d?.data?.owner).toLowerCase()}'`)
      .join(',');

    const users = await getRepository(User).find({
      where: {
        accountAddress: Raw((alias) => `LOWER(${alias}) IN (${allAddress})`),
      },
    });

    const formatedData: any = data?.map((d) => {
      const nftDetails = nfts?.find(
        (n) => String(n?.nftId) === String(d?.data?.tokenId),
      );
      const ownerUser = users?.find(
        (u) =>
          String(u?.accountAddress).toLowerCase() ===
          String(d?.data?.owner).toLowerCase(),
      );

      return {
        counter: parseInt(d?.data?.counter, 10),
        stacked_by: ownerUser,
        nft: nftDetails,
        rates: parseInt(d?.data?.rates, 10),
        stackedOn: new Date(parseInt(d?.data?.stackedOn) * 1000),
        ends: new Date(parseInt(d?.data?.ends) * 1000),
        isCategoryVerified: String(d?.data?.isCategoryVerified) === 'true',
        stakingTime: 0,
        totalReward: 0,
        txId: d?.transaction_hash,
      };
    });

    const saved = await getRepository(NFTStacked).save(formatedData);

    // update flag for owner nft table
    // saved
  }

  async setUnNFTStackedRecords(data: any) {
    const nftStacked = await getRepository(NFTStacked).find({
      where: {
        counter: In(data?.map((d) => parseInt(d?.data?.counter, 10))),
      },
    });

    const formatedData: any = data?.map((d) => {
      const nftDetails = nftStacked?.find(
        (n) => String(n?.counter) === String(d?.data?.counter),
      );
      return {
        ...nftDetails,
        rates: parseInt(d?.data?.rates, 10),
        stakingTime: parseInt(d?.data?.stakingTime, 10),
        totalReward: parseInt(d?.data?.totalReward, 10),
        txId: d?.transaction_hash,
        isArchived: true,
      };
    });

    await getRepository(NFTStacked).save(formatedData);
  }

  async setNFTCategoryValidated(data: any) {
    const nftStacked = await getRepository(NFTStacked).find({
      where: {
        nft: {
          nftId: In(data?.map((d) => parseInt(d?.data?.tokenId, 10))),
        },
      },
    });

    await getRepository(NFTStacked).update(
      {
        nft: In(nftStacked),
      },
      {
        isCategoryVerified: true,
      },
    );
  }

  async getNFTCategoryMetadata() {
    const totalNFTs = await contractNFT.methods.totalSupply().call();
    const syncedNFTsForStacking = await getRepository(Config).findOne({
      name: 'syncedNFTsForStacking',
    });

    let counter = 1;
    if (syncedNFTsForStacking) {
      counter = parseInt(syncedNFTsForStacking?.value, 10) + 1;
    } else {
      await getRepository(Config).save({
        name: 'syncedNFTsForStacking',
        value: '1',
      });
    }

    const data = [];
    while (counter < parseInt(totalNFTs, 10)) {
      const res = await axios.get(`https://apix.cubixpro.io/nfts/${counter}`);
      data.push({
        categoryId:
          categoryMapForStaking?.[
            res?.data?.attributes?.find((d) => d?.trait_type === 'Category')
              ?.value
          ] ?? 0,
        tokenId: String(counter),
        txId: '',
      });

      try {
        await getRepository(NFTStackedValidated).save(data);
      } catch (error) {
        console.log({ error });
      }
      console.log({ counter });
      await getRepository(Config).update(
        {
          name: 'syncedNFTsForStacking',
        },
        {
          value: String(counter),
        },
      );
      counter++;
    }

    return 'done';
  }

  async getMarketplaceTeams() {
    const teams = await getRepository(NFTOwnerRelation).query(
      `SELECT DISTINCT country from nft_owners_relation`,
    );

    const categories = await getRepository(NFTOwnerRelation).query(
      `SELECT DISTINCT category from nft_owners_relation`,
    );

    return {
      teams: teams
        ?.filter((t) => t?.country !== null)
        ?.map((_t) => _t?.country),
      categories: categories
        ?.filter((c) => c?.category !== null)
        .map((_c) => _c?.category),
    };
  }
}
