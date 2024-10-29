import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as moment from 'moment';
import { rewardDeltaInHours } from 'src/app/config/app.constants';
import { configService } from 'src/app/config/config.service';
import {
  contractNFT,
  contractStacking,
  contractStakingReward,
  cubixTokenDecimals,
  web3,
} from 'src/app/config/web3.constants';
import { MarketplaceService } from 'src/app/modules/marketplace/marketplace.service';
import { Config } from 'src/models/config.entity';
import { NFTHoldingRewards } from 'src/models/nftHoldingRewards.entity';
import { NFTHoldingRewardsRecords } from 'src/models/nftHoldingRewardsTx.entity';
import { NFTOwnerRelation } from 'src/models/nftOwner.entity';
import { NFTRewardsClaims } from 'src/models/nftRewardsClaims.entity';
import { NFTStackedValidated } from 'src/models/nftStackedValidated.entity';
import { User } from 'src/models/user.entity';
import { getRepository, In, LessThanOrEqual, Not, Raw } from 'typeorm';
import {
  MoaralisAPIBasePath,
  MoaralisAPIBasePathForNFTCricket,
  MoaralisAPIBasePathForStacking,
  MoaralisAPIBasePathForStackingForRewards,
  MoaralisAPIBasePathForStackingForRewardsV2,
  MoralistNFTsPath,
  topics,
  topicsABIs,
  topicsABIsMap,
} from './marketplace.contants';

axios.defaults.headers['X-API-Key'] = configService.getMoralisAPIKey();

axios.interceptors.request.use((config) => {
  return config;
});

axios.interceptors.response.use((response) => {
  return response;
});

@Injectable()
export class SmartContractService {
  constructor(private marketplaceService: MarketplaceService) {}
  apiKey = configService.getAlchemyAPIKey();
  baseURL = `https://polygon-mainnet.g.alchemy.com/nft/v2/${this.apiKey}/`;
  // baseURL = `https://polygon-mumbai.g.alchemy.com/nft/v2/${this.apiKey}/`;
  contractAddr = configService.getNFTContractAddress();
  startToken = '1';
  withMetadata = 'false';

  static pageKey;
  async getNFTsForCollection(owner: string) {
    let nfts = [];
    let response;
    let cursor;
    try {
      do {
        const config = {
          method: 'get',
          url: `${MoralistNFTsPath(owner)}&${cursor ? `cursor=${cursor}` : ''}`,
          headers: {},
        };
        console.log([config.url]);

        response = await axios.get(config.url);
        cursor = response?.data?.cursor;
        nfts = [...nfts, ...response?.data?.result];
        console.log([cursor, nfts?.length]);
      } while (cursor);
    } catch (error) {
      console.log(error);
    }

    return nfts;
  }

  async getNFTsOwners() {
    const config = {
      method: 'get',
      url: `${this.baseURL}getOwnersForCollection?contractAddress=${this.contractAddr}&withTokenBalances=true`,
      headers: {},
    };

    try {
      const response = await axios.get(config.url);
      return response?.data?.ownerAddresses;
    } catch (error) {
      console.log(error);
    }
  }

  listenerForEvents() {
    Logger.log(
      `+++++++++++++++++++++ CRON listenerForEvents ++++++++++++++++++++++++++`,
    );

    if (!configService.getRunCrons()) {
      console.log('Cron is disabled in ENV');
      return;
    }

    try {
      this.getContractAllPastEventsUsingMoralisAPIs();
    } catch (error) {
      Logger.error(JSON.stringify(error));
    }
  }

  async getContractAllPastEventsUsingMoralisAPIs() {
    await this.getMarketplaceRecords();
    await this.getMarketplaceOffersRecords();
    await this.getMarketplaceAcceptedOffers();
    await this.getMarketplaceBuyNFTRecords();
    await this.getMarketplaceBids();
    await this.getMarketplaceAuctionNFTWinnerRecords();
    // stacking events
    // await this.getStackedNFTs();
    // await this.getUnStackedNFTs();
  }
  // marketplace related config using moralis APIs

  async getMarketplaceBids() {
    const lastBlock = await this.getLastBlockFetchedForEvents(
      'PutBidOnAuction',
    );

    let url = `${MoaralisAPIBasePath}${topics.PutBidOnAuction}`;
    if (lastBlock) {
      url = `${url}&from_block=${lastBlock}`;
    }
    try {
      const response = await axios.post(url, topicsABIs.PutBidOnAuction);
      console.log([
        'PutBidOnAuction',
        url,
        JSON.stringify(response?.data?.result),
      ]);
      await this.setLastBlockFetchedForEvents(
        response?.data?.result?.[0]?.block_number,
        'PutBidOnAuction',
      );
      await this.marketplaceService.setMarketplaceBids(response?.data?.result);
      return response?.data?.result;
    } catch (error) {
      console.log(error);
    }
  }

  async getMarketplaceRecords() {
    const lastBlock = await this.getLastBlockFetchedForEvents(
      'PutOnMarketPlace',
    );

    let url = `${MoaralisAPIBasePath}${topics.PutOnMarketPlace}`;
    if (lastBlock) {
      url = `${url}&from_block=${lastBlock}`;
    }

    try {
      const response = await axios.post(url, topicsABIs.PutOnMarketPlace);

      console.log([
        'PutOnMarketPlace',
        url,
        JSON.stringify(response?.data?.result),
      ]);

      await this.setLastBlockFetchedForEvents(
        response?.data?.result?.[0]?.block_number,
        'PutOnMarketPlace',
      );
      await this.marketplaceService.setMarketplaceRecords(
        response?.data?.result,
      );
    } catch (error) {
      console.log(error);
    }
  }

  async getMarketplaceAcceptedOffers() {
    const lastBlock = await this.getLastBlockFetchedForEvents('OfferAccepted');
    let url = `${MoaralisAPIBasePath}${topics.OfferAccepted}`;
    if (lastBlock) {
      url = `${url}&from_block=${lastBlock}`;
    }

    try {
      const response = await axios.post(url, topicsABIs.OfferAccepted);
      console.log([
        'OfferAccepted',
        url,
        JSON.stringify(response?.data?.result),
      ]);

      await this.setLastBlockFetchedForEvents(
        response?.data?.result?.[0]?.block_number,
        'OfferAccepted',
      );
      await this.marketplaceService.setMarketplaceAcceptedOffers(
        response?.data?.result,
      );
    } catch (error) {
      console.log(error);
    }
  }

  async getMarketplaceOffersRecords() {
    const lastBlock = await this.getLastBlockFetchedForEvents('PutOfferOnSale');
    let url = `${MoaralisAPIBasePath}${topics.PutOfferOnSale}`;
    if (lastBlock) {
      url = `${url}&from_block=${lastBlock}`;
    }
    try {
      const response = await axios.post(url, topicsABIs.PutOfferOnSale);
      console.log([
        'PutOfferOnSale',
        url,
        JSON.stringify(response?.data?.result),
      ]);
      await this.setLastBlockFetchedForEvents(
        response?.data?.result?.[0]?.block_number,
        'PutOfferOnSale',
      );
      await this.marketplaceService.setMarketplaceOffersRecords(
        response?.data?.result,
      );
    } catch (error) {
      console.log(error);
    }
  }

  async getMarketplaceBuyNFTRecords() {
    const lastBlock = await this.getLastBlockFetchedForEvents('BuyNFT');
    let url = `${MoaralisAPIBasePath}${topics.BuyNFT}`;
    if (lastBlock) {
      url = `${url}&from_block=${lastBlock}`;
    }
    try {
      const response = await axios.post(url, topicsABIs.BuyNFT);
      console.log(['BuyNFT', url, JSON.stringify(response?.data?.result)]);

      await this.setLastBlockFetchedForEvents(
        response?.data?.result?.[0]?.block_number,
        'BuyNFT',
      );
      await this.marketplaceService.setMarketplaceBuyNFTRecords(
        response?.data?.result,
      );
    } catch (error) {
      console.log(error);
    }
  }

  async getMarketplaceRentedNFTRecords() {
    const lastBlock = await this.getLastBlockFetchedForEvents('RentedNFT');
    let url = `${MoaralisAPIBasePath}${topics.RentedNFT}`;
    if (lastBlock) {
      url = `${url}&from_block=${lastBlock}`;
    }
    try {
      const response = await axios.post(url, topicsABIs.RentedNFT);
      await this.setLastBlockFetchedForEvents(
        response?.data?.result?.[0]?.block_number,
        'RentedNFT',
      );
      return response?.data?.result;
    } catch (error) {
      console.log(error);
    }
  }

  async getMarketplaceAuctionNFTWinnerRecords() {
    const lastBlock = await this.getLastBlockFetchedForEvents(
      'AuctionWinnerDeclared',
    );
    let url = `${MoaralisAPIBasePath}${topics.AuctionWinnerDeclared}`;
    if (lastBlock) {
      url = `${url}&from_block=${lastBlock}`;
    }
    try {
      const response = await axios.post(url, topicsABIs.AuctionWinnerDeclared);
      console.log([
        'AuctionWinnerDeclared',
        url,
        JSON.stringify(response?.data?.result),
      ]);

      await this.setLastBlockFetchedForEvents(
        response?.data?.result?.[0]?.block_number,
        'AuctionWinnerDeclared',
      );

      await this.marketplaceService.setMarketplaceAuctionWinner(
        response?.data?.result,
      );
    } catch (error) {
      console.log(error);
    }
  }

  async setLastBlockFetchedForEvents(lastBlock: string, eventName: string) {
    if (!lastBlock) {
      return;
    }
    const exist = await getRepository(Config).findOne({
      name: eventName,
    });

    await getRepository(Config).save({
      id: exist?.id,
      name: eventName,
      value: String(parseInt(lastBlock, 10) + 1),
    });

    return;
  }

  async getLastBlockFetchedForEvents(eventName: string) {
    const exist = await getRepository(Config).findOne({
      name: eventName,
    });

    return exist?.value;
  }

  async getStackedNFTs() {
    const lastBlock = await this.getLastBlockFetchedForEvents('NFTStaked');

    let url = `${MoaralisAPIBasePathForStacking}${topics.NFTStaked}`;
    if (lastBlock) {
      url = `${url}&from_block=${lastBlock}`;
    }

    try {
      const response = await axios.post(url, topicsABIs.NFTStaked);

      await this.setLastBlockFetchedForEvents(
        response?.data?.result?.[0]?.block_number,
        'NFTStaked',
      );
      await this.marketplaceService.setNFTStackedRecords(
        response?.data?.result,
      );
    } catch (error) {
      console.log(error);
    }
  }

  async getUnStackedNFTs() {
    const lastBlock = await this.getLastBlockFetchedForEvents('NFTUnstaked');

    let url = `${MoaralisAPIBasePathForStacking}${topics.NFTUnstaked}`;
    if (lastBlock) {
      url = `${url}&from_block=${lastBlock}`;
    }

    try {
      const response = await axios.post(url, topicsABIs.NFTUnstaked);
      await this.setLastBlockFetchedForEvents(
        response?.data?.result?.[0]?.block_number,
        'NFTUnstaked',
      );
      await this.marketplaceService.setUnNFTStackedRecords(
        response?.data?.result,
      );
    } catch (error) {
      console.log(error);
    }
  }

  async getNFTCategoryValidated() {
    const lastBlock = await this.getLastBlockFetchedForEvents(
      'NFTCategoryValidated',
    );

    let url = `${MoaralisAPIBasePathForStacking}${topics.NFTCategoryValidated}`;
    if (lastBlock) {
      url = `${url}&from_block=${lastBlock}`;
    }

    try {
      const response = await axios.post(url, topicsABIs.NFTCategoryValidated);
      await this.setLastBlockFetchedForEvents(
        response?.data?.result?.[0]?.block_number,
        'NFTCategoryValidated',
      );
      await this.marketplaceService.setNFTCategoryValidated(
        response?.data?.result,
      );
    } catch (error) {
      console.log(error);
    }
  }

  async fetchMetadataAndValidatedNFTsForStacking() {
    const notAddedOnStakeContract = await getRepository(
      NFTStackedValidated,
    ).find({
      txId: '',
    });

    const tokenIds = [];
    const categoryIds = [];
    const address = [];

    notAddedOnStakeContract?.forEach((d, index) => {
      tokenIds[index] = d?.tokenId;
      categoryIds[index] = d?.categoryId;
      address[index] = '0xd9DA608BA865EE2A809143A8d76eDe8f1A1669Dc';
    });

    await contractStacking.methods.validateCategoryOfStackedNFT(
      address,
      tokenIds,
      categoryIds,
    );
  }

  async getTransferredNFTs() {
    // this is for init existing NFTs
    const lastBlock = await this.getLastBlockFetchedForEvents(
      'NFT_TRANSFER_BLOCK',
    );

    let response;
    let offset = 0;

    let calls = 0;

    do {
      try {
        let url = `${MoaralisAPIBasePathForNFTCricket}${topics.NFT_TRANSFER}`;
        if (lastBlock) {
          url = `${url}&from_block=${lastBlock}`;
        }
        if (offset !== 0) {
          url = url + `&offset=${offset}`;
        }

        response = await axios.post(url, topicsABIs.NFT_TRANSFER);

        console.log([
          'NFT_TRANSFER',
          url,
          JSON.stringify(response?.data?.result),
        ]);

        if (calls === 0 && response?.data?.result?.[0]?.block_number) {
          await this.setLastBlockFetchedForEvents(
            response?.data?.result?.[0]?.block_number,
            'NFT_TRANSFER_BLOCK',
          );
        }

        const data = response?.data?.result;
        for (const transferEvent of data) {
          await this.updateNFTOwnerShip(
            transferEvent?.data,
            transferEvent?.transaction_hash,
          );

          // // start Time to consider
          // let startTimeToConsider = moment(starts);
          // if (
          //   startTimeToConsider.isBefore(moment(transferEvent?.block_timestamp))
          // ) {
          //   startTimeToConsider = moment(transferEvent?.block_timestamp);
          // }
          // const endTimeToConsider = moment(startTimeToConsider).add(
          //   rewardDeltaInHours,
          //   'hours',
          // );

          // const uniqueKey = `${transferEvent?.data?.tokenId}_${transferEvent?.data?.from}_${transferEvent?.data?.to}_${transferEvent?.block_number}`;

          // // update prev entered record as inactivate for rewards
          // let exists;
          // if (init) {
          //   exists = await getRepository(NFTHoldingRewards).findOne({
          //     select: ['id'],
          //     where: {
          //       nft: parseInt(transferEvent?.data?.tokenId, 10),
          //     },
          //   });
          // }

          // try {
          //   const saved = await getRepository(NFTHoldingRewards).save({
          //     holder: transferEvent?.data?.to,
          //     nft: parseInt(transferEvent?.data?.tokenId, 10),
          //     uniqueKey,
          //     startTimeToConsider: startTimeToConsider.toDate(),
          //     endTimeToConsider: endTimeToConsider.toDate(),
          //     totalClaimableRewards: 0,
          //     totalClaimedRewards: 0,
          //     isActive: exists?.id && init ? false : true,
          //   });
          //   if (!init && saved) {
          //     await getRepository(NFTHoldingRewards).update(
          //       {
          //         nft: parseInt(transferEvent?.data?.tokenId, 10),
          //         id: Not(saved?.id),
          //       },
          //       {
          //         isActive: false,
          //       },
          //     );
          //   }
          // } catch (error) {
          //   // silent error if duplicate entry tried to be entered
          // }
        }

        calls++;

        offset = offset + 100;
      } catch (error) {
        console.log(error);
      }
    } while (response?.data?.result?.length > 0);
  }

  // logic to calculate rewards here
  async syncReward() {
    const now = moment();

    const records = await getRepository(NFTHoldingRewards).find({
      where: {
        isActive: true,
        endTimeToConsider: LessThanOrEqual(now.toDate()),
      },
      relations: ['NFTHoldingRewardsRecords'],
      order: {
        createDateTime: 'DESC',
      },
    });

    let totalSupply = await contractNFT.methods.totalSupply().call();
    totalSupply = parseInt(totalSupply, 10);

    console.log({ syncToData: records?.length });

    for (const record of records) {
      const startTimeToConsider =
        record?.NFTHoldingRewardsRecords?.length <= 0
          ? record?.startTimeToConsider
          : record?.NFTHoldingRewardsRecords?.[0]?.endTimeToConsider;

      const endTimeToConsider = moment(startTimeToConsider).add(
        rewardDeltaInHours,
        'hours',
      );

      // to make sure, record of reward entered once for day
      const uniqueKey = `${record?.id}_${now.format('YYYYMMDD')}`;

      await getRepository(NFTHoldingRewardsRecords).save({
        nftHolding: record,
        startTimeToConsider: moment(startTimeToConsider).toDate(),
        endTimeToConsider: endTimeToConsider.toDate(),
        totalClaimableRewards: this.getNFTTotalSupplyBasedReward(totalSupply),
        totalSupply,
        uniqueKey,
        typeOfCard: 'intl',
      });

      await getRepository(NFTHoldingRewards).update(
        {
          id: record?.id,
        },
        {
          endTimeToConsider: moment(record?.endTimeToConsider).add(
            rewardDeltaInHours,
            'hours',
          ),
        },
      );
    }

    console.log('-- done reward sync --' + now.format('YYYYMMDDHH'));
  }

  getNFTTotalSupplyBasedReward(totalNFTs: number) {
    const rewardMatrix = [
      {
        totalSupplyLimit: 1,
        tokens: 2 * cubixTokenDecimals,
        typeOfPlayer: 'intl',
      },
      {
        totalSupplyLimit: 50001,
        tokens: 1.8 * cubixTokenDecimals,
        typeOfPlayer: 'intl',
      },
      {
        totalSupplyLimit: 100001,
        tokens: 1.62 * cubixTokenDecimals,
        typeOfPlayer: 'intl',
      },
      {
        totalSupplyLimit: 150001,
        tokens: 1.458 * cubixTokenDecimals,
        typeOfPlayer: 'intl',
      },
    ];

    let rewards = 0;
    for (let index = 0; index < rewardMatrix.length; index++) {
      if (totalNFTs >= rewardMatrix[index].totalSupplyLimit) {
        rewards = rewardMatrix[index].tokens;
        break;
      }
    }
    return rewards;
  }

  async getNFTHoldingRewardsRecords(
    accountAddress: string,
    withRecords = false,
  ) {
    const now = moment().toDate();

    let records = [];
    let total = 0;
    if (withRecords) {
      [records, total] = await getRepository(
        NFTHoldingRewardsRecords,
      ).findAndCount({
        select: ['totalClaimableRewards', 'requestId', 'txId', 'id'],
        relations: ['nftHolding'],
        where: {
          isActive: true,
          endTimeToConsider: LessThanOrEqual(now),
          txId: null,
          nftHolding: {
            holder: Raw(
              (alias) =>
                `LOWER(${alias}) = '${String(accountAddress).toLowerCase()}'`,
            ),
          },
        },
      });
      const totalRewards = records?.reduce(
        (c, a) => c + a?.totalClaimableRewards,
        0,
      );

      return {
        totalRewards,
        records,
      };
    }

    const totalRewardsQuery = getRepository(NFTHoldingRewardsRecords)
      .createQueryBuilder('rewards')
      .innerJoinAndSelect('rewards.nftHolding', 'nftHolding')
      .select('SUM(rewards.total_claimable_rewards)', 'total')
      .where(
        `LOWER(nftHolding.holder) = '${String(accountAddress).toLowerCase()}'`,
      );

    const totalClaimableRewardsQuery = getRepository(NFTHoldingRewardsRecords)
      .createQueryBuilder('rewards')
      .innerJoinAndSelect('rewards.nftHolding', 'nftHolding')
      .select('SUM(rewards.total_claimable_rewards)', 'total')
      .where(
        `LOWER(nftHolding.holder) = '${String(accountAddress).toLowerCase()}'`,
      )
      .andWhere('rewards.request_id IS NOT NULL');

    const totalClaimedRewardsQuery = getRepository(NFTHoldingRewardsRecords)
      .createQueryBuilder('rewards')
      .innerJoinAndSelect('rewards.nftHolding', 'nftHolding')
      .select('SUM(rewards.total_claimable_rewards)', 'total')
      .where(
        `LOWER(nftHolding.holder) = '${String(accountAddress).toLowerCase()}'`,
      )
      .andWhere('rewards.tx_id IS NOT NULL');

    const [totalRewards, totalClaimableRewards, totalClaimedRewards] =
      await Promise.all([
        totalRewardsQuery.getRawOne(),
        totalClaimableRewardsQuery.getRawOne(),
        totalClaimedRewardsQuery.getRawOne(),
      ]);

    const notClaimedRewards =
      totalRewards?.total - totalClaimableRewards?.total;

    return {
      records,
      total,
      totalRewards: totalRewards?.total,
      now,
      totalClaimableRewards: totalClaimableRewards?.total,
      notClaimedRewards,
      totalClaimedRewards: totalClaimedRewards?.total ?? 0,
      totalClaimableRewardsFormated:
        totalClaimableRewards?.total / cubixTokenDecimals,
      totalRewardsFormated: totalRewards?.total / cubixTokenDecimals,
      notClaimedRewardsFormated: notClaimedRewards / cubixTokenDecimals,
      totalClaimedRewardsFormated:
        (totalClaimedRewards?.total ?? 0) / cubixTokenDecimals,
    };
  }

  async getClaimRequests() {
    const lastBlock = await this.getLastBlockFetchedForEvents('ClaimRequested');

    let url = `${MoaralisAPIBasePathForStackingForRewards}${topics.ClaimRequested}`;
    if (lastBlock) {
      url = `${url}&from_block=${lastBlock}`;
    }

    try {
      const response = await axios.post(url, topicsABIs.ClaimRequested);
      console.log(['ClaimRequested', url, response?.data]);

      for (const event of response?.data?.result) {
        await this.handleClaimRequest(event);
      }

      await this.setLastBlockFetchedForEvents(
        response?.data?.result?.[0]?.block_number,
        'ClaimRequested',
      );
    } catch (error) {
      console.log(error);
    }
  }

  async handleClaimRequest(event: any) {
    try {
      const now = moment().unix();
      const rewards = await this.getNFTHoldingRewardsRecords(
        event?.data?.requester,
        true,
      );

      console.log('+++++++++++++ STARTED CLAIM +++++++++++++');
      console.log([
        event?.data?.requester,
        rewards?.totalRewards,
        rewards?.records?.length,
        event?.data?.counter,
      ]);
      console.log('+++++++++++++ STARTED CLAIM +++++++++++++');

      if (rewards?.totalRewards > 0) {
        const fastTxGasFeeForApproval = await this.getRecommendedGasPrice();

        await getRepository(NFTHoldingRewardsRecords).update(
          {
            id: In(rewards.records.map((r) => r?.id)),
          },
          {
            requestId: String(event?.data?.counter),
          },
        );

        const receipt = await contractStakingReward.methods
          .claim(
            event?.data?.requester,
            web3.utils.toWei(
              String(rewards?.totalRewards / cubixTokenDecimals),
              'ether',
            ),
            true,
            now,
          )
          .send({
            // nonce: accountNonce,
            gasPrice: fastTxGasFeeForApproval,
            from: configService.getStakingManager(),
          })
          .on('error', (error) => {
            console.log('+++++++++++++ STARTED CLAIM Error +++++++++++++');
            console.log(error);
            console.log('+++++++++++++ STARTED CLAIM Error +++++++++++++');
          });

        console.log('+++++++++++++ SUCCESS CLAIM TX +++++++++++++');
        console.log([event?.data?.counter, receipt?.transactionHash]);
        console.log('+++++++++++++ SUCCESS CLAIM TX +++++++++++++');

        if (receipt?.transactionHash) {
          await getRepository(NFTHoldingRewardsRecords).update(
            {
              requestId: String(event?.data?.counter),
            },
            {
              txId: String(receipt?.transactionHash),
            },
          );

          // make entry in claims table for user
          await getRepository(NFTRewardsClaims).save({
            amount: web3.utils.toWei(
              String(rewards?.totalRewards / cubixTokenDecimals),
              'ether',
            ),
            accountAddress: event?.data?.requester ?? '',
            txHash: receipt?.transactionHash ?? '',
          });
        }
      }
    } catch (error) {
      console.log({ error });
    }
  }

  async getRecommendedGasPrice() {
    const gasStation = await axios.get(
      `https://gasstation-mainnet.matic.network/v2?cacheBuster=${new Date().getTime()}`,
    );
    const fastTxGasFee = gasStation?.data?.fast?.maxFee;
    return web3.utils.toWei(String(Math.ceil(fastTxGasFee)), 'gwei');
  }

  async updateNFTOwnerShip(eventData: any, tx: string) {
    try {
      let user = await getRepository(User).findOne({
        accountAddress: Raw(
          (alias) =>
            `LOWER(${alias}) = '${String(eventData?.to).toLowerCase()}'`,
        ),
      });

      if (!user?.id) {
        user = await getRepository(User).save({
          accountAddress: String(eventData?.to).toLowerCase(),
          userName: String(eventData?.to)?.slice(0, 12),
        });
      }

      const exists = await getRepository(NFTOwnerRelation).findOne({
        nftId: parseInt(eventData?.tokenId, 10),
      });

      if (exists) {
        await getRepository(NFTOwnerRelation).update(
          {
            id: exists?.id,
          },
          {
            user,
            currentOwner: String(eventData?.to).toLowerCase(),
          },
        );
        return;
      }

      await getRepository(NFTOwnerRelation).save({
        user,
        blockchainData: eventData?.tokenId,
        currentOwner: String(eventData?.to).toLowerCase(),
        metaData: `https://apix.cubixpro.io/nfts/${eventData?.tokenId}`,
        nftId: parseInt(eventData?.tokenId, 10),
        txHash: tx,
        uniqueEventId: eventData?.tokenId,
      });
    } catch (error) {
      console.log('ERROR IN -> updating owner');
    }
  }

  async getClaimedRequest() {
    const lastBlock = await this.getLastBlockFetchedForEvents('ClaimedV2');
    let url = `${MoaralisAPIBasePathForStackingForRewardsV2}${topics.ClaimedV2}`;
    if (lastBlock) {
      url = `${url}&from_block=${lastBlock}`;
    }
    try {
      const response = await axios.post(url, topicsABIs.ClaimedV2);
      await this.setLastBlockFetchedForEvents(
        response?.data?.result?.[0]?.block_number,
        'ClaimedV2',
      );

      console.log(['ClaimedV2', url, JSON.stringify(response?.data?.result)]);

      for (const item of response?.data?.result) {
        await getRepository(NFTRewardsClaims).save({
          amount: item?.data?.amount,
          accountAddress: item?.data?.owner ?? '',
          txHash: item?.transaction_hash ?? '',
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async moralisWebhook(data) {
    console.log(['Moralis webhook', JSON.stringify(data)]);
    const logs = data?.logs;

    for (let index = 0; index < logs.length; index++) {
      const log = logs[index];
      const encodedData = log?.data;
      const confirmed = data?.confirmed;
      const blockNumber = data?.block?.number;

      if (confirmed) {
        return;
      }

      console.log(topicsABIsMap?.[log?.topic0]?.inputs, encodedData, [
        log?.topic0,
      ]);

      if (log?.topic0 === topics.NFT_TRANSFER) {
        const nftTransfers = data?.nftTransfers;
        if (nftTransfers?.length > 0) {
          for (let index = 0; index < nftTransfers.length; index++) {
            const eventData = nftTransfers[index];
            await this.updateNFTOwnerShip(
              eventData,
              eventData?.transactionHash,
            );
          }
          continue;
        }
        continue;
      }

      const decodedData = web3.eth.abi.decodeLog(
        topicsABIsMap?.[log?.topic0]?.inputs,
        encodedData,
        [log?.topic0],
      );

      const decoded = {
        transaction_hash: data?.txs?.[index]?.hash,
        data: { ...decodedData },
      };

      console.log({ decoded });
      switch (log?.topic0) {
        case topics.PutBidOnAuction:
          await this.marketplaceService.setMarketplaceBids([decoded]);
          break;
        case topics.PutOnMarketPlace:
          await this.marketplaceService.setMarketplaceRecords([decoded]);
          break;
        case topics.OfferAccepted:
          await this.marketplaceService.setMarketplaceOffersRecords([decoded]);
          break;
        case topics.PutOfferOnSale:
          await this.marketplaceService.setMarketplaceOffersRecords([decoded]);
          break;
        case topics.BuyNFT:
          await this.marketplaceService.setMarketplaceBuyNFTRecords([decoded]);
          break;
        case topics.RentedNFT:
          await this.marketplaceService.setMarketplaceRentedNFTRecords([
            decoded,
          ]);
          break;
        case topics.AuctionWinnerDeclared:
          await this.marketplaceService.setMarketplaceAuctionWinner([decoded]);
          break;

        case topics.ClaimedV2:
          await getRepository(NFTRewardsClaims).save({
            amount: decoded?.data?.amount,
            accountAddress: decoded?.data?.owner ?? '',
            txHash: decoded?.transaction_hash ?? '',
          });
          break;
        default:
          break;
      }
    }
  }
}
