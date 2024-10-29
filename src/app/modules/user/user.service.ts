import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import * as moment from 'moment';
import { configService } from 'src/app/config/config.service';
import { categoryMapForStaking } from 'src/app/config/web3.constants';
import { UpdateProfileDTO } from 'src/app/dto/users/UpdateProfile.dto';
import { SmartContractService } from 'src/app/services/smart-contract/smart-contract.service';
import { EmailSubscription } from 'src/models/emailSubscription.entity';
import { MarketPlace } from 'src/models/marketplaceRecords.entity';
import { NFTFav } from 'src/models/nftFav.entity';
import { NFTHoldingRewards } from 'src/models/nftHoldingRewards.entity';
import { NFTHoldingRewardsRecords } from 'src/models/nftHoldingRewardsTx.entity';
import { NFTOwnerRelation } from 'src/models/nftOwner.entity';
import { NFTStacked } from 'src/models/nftStacked.entity';
import { NFTStackedValidated } from 'src/models/nftStackedValidated.entity';
import { User } from 'src/models/user.entity';
import { UserFollow } from 'src/models/userFollow.entity';
import {
  getRepository,
  In,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Not,
  Raw,
} from 'typeorm';
import { MarketplaceService } from '../marketplace/marketplace.service';

@Injectable()
export class UserService {
  constructor(
    private smartContractService: SmartContractService,
    private jwtService: JwtService,
    private marketplaceService: MarketplaceService,
  ) {}
  async syncNFT() {
    return null;
    const nftOwners = await this.smartContractService.getNFTsOwners();

    if (Array.isArray(nftOwners)) {
      const users = nftOwners?.map((nftOwner) => {
        return {
          accountAddress: nftOwner?.ownerAddress,
          uniqueEventId: nftOwner?.ownerAddress,
          ownedNFTs: nftOwner?.tokenBalances,
        };
      });

      const savedUsers = await getRepository(User).find();

      let notSavedUsers = savedUsers?.length === 0 ? users : [];
      if (savedUsers?.length > 0) {
        notSavedUsers = users?.filter((user) => {
          return !savedUsers?.find(
            (savedUser) =>
              String(savedUser?.accountAddress).toLowerCase() ===
              String(user?.accountAddress).toLowerCase(),
          )?.id;
        });
      }

      console.log({ savedUsers, notSavedUsers });
      const newSavedUsers = await getRepository(User).save(notSavedUsers);

      const allUsers = [...savedUsers, ...newSavedUsers];
      for (const user of allUsers) {
        const nfts =
          users?.find(
            (u) =>
              String(u?.accountAddress).toLowerCase() ===
              String(user?.accountAddress).toLowerCase(),
          )?.ownedNFTs ?? [];

        for (const nft of nfts) {
          const existingNFT = await getRepository(NFTOwnerRelation).findOne({
            uniqueEventId: nft?.tokenId,
          });
          const nftId = parseInt(nft?.tokenId, 10);
          if (existingNFT) {
            await getRepository(NFTOwnerRelation).save({
              user,
              id: existingNFT?.id,
              currentOwner: String(user?.accountAddress).toLowerCase(),
            });
          } else {
            await getRepository(NFTOwnerRelation).save({
              user,
              blockchainData: nft?.tokenId,
              currentOwner: String(user?.accountAddress).toLowerCase(),
              metaData: `https://apix.cubixpro.io/nfts/${nftId}`,
              nftId,
              txHash: nft?.tokenId,
              uniqueEventId: nft?.tokenId,
            });
          }
        }
      }
    }
    return nftOwners;
  }

  async getAvailableNFTs(query: any) {
    if (query?.where?.currentOwner) {
      query.where.currentOwner = String(query.where.currentOwner).toLowerCase();
    }

    query.where.no = In(String(query.where.no).split(','));

    if (query.where.accountAddress) {
      const accountAddress = query.where.accountAddress;

      delete query.where.accountAddress;

      query.where = [
        {
          ...query.where,
        },
        {
          ...query.where,
          currentOwner: String(accountAddress).toLowerCase(),
        },
      ];
    }

    const [records, total] = await getRepository(NFTOwnerRelation).findAndCount(
      query,
    );

    if (query.extra?.only_numbers === 'true') {
      return records?.map((record) => record?.no).join(',');
    }
    return {
      total,
      records,
    };
  }

  // http://localhost:3001/api/v1/user/available-nfts?select[]=no&where[currentOwner]=0x28B111403EC06984f653345D76730452daf97A0f&where[no]=232,235&extra[only_numbers]=true

  async nfts(query: any) {
    if (query?.where?.currentOwner) {
      query.where.currentOwner = String(query.where.currentOwner).toLowerCase();
    }

    if (query?.extra?.userName && query?.extra?.userName) {
      const user = await getRepository(User).findOneOrFail({
        userName: query?.extra?.userName,
      });
      query.where = { user };
    }

    const now = new Date();
    if (query?.extra?.stacked) {
      const stackedNFTs = await getRepository(NFTStacked).find({
        relations: ['nft'],
        where: {
          stackedOn: LessThanOrEqual(now),
          ends: MoreThanOrEqual(now),
        },
      });
      query.where = {
        ...query.where,
        id:
          query?.extra?.stacked === 'Stacked'
            ? In(stackedNFTs?.map((d) => d?.nft?.id))
            : Not(In(stackedNFTs?.map((d) => d?.nft?.id))),
      };
    }

    if (query?.extra?.keyword && query?.extra?.keyword) {
      if (!isNaN(parseInt(query?.extra?.keyword, 10))) {
        query.where = {
          nftId: parseInt(query?.extra?.keyword, 10),
        };
      } else {
        query.where = [
          {
            ...query.where,
            name: Like(`%${query?.extra?.keyword}%`),
          },
          {
            ...query.where,
            country: Like(`%${query?.extra?.keyword}%`),
          },
          {
            ...query.where,
            category: Like(`%${query?.extra?.keyword}%`),
          },
          {
            ...query.where,
            shortName: Like(`%${query?.extra?.keyword}%`),
          },
        ];
      }
    }

    if (query?.extra?.accountAddress) {
      query.where = [
        {
          ...query.where,
        },
        {
          ...query.where,
          currentOwner: String(query?.extra?.accountAddress).toLowerCase(),
        },
      ];
    }

    const resultSet: any = await getRepository(NFTOwnerRelation).findAndCount(
      query,
    );

    let records = resultSet?.[0];
    const total = resultSet?.[1];

    // get marketplace details of list NFTs
    const marketPlace = await getRepository(MarketPlace).find({
      where: {
        nftDetails: In(records?.map((r) => r?.id)),
        typeOfSale: In([
          this.marketplaceService.marketPlaceNFTStatus.ON_SALE,
          this.marketplaceService.marketPlaceNFTStatus.ON_AUCTION,
          this.marketplaceService.marketPlaceNFTStatus.ON_RENT,
        ]),
      },
      order: {
        createDateTime: 'DESC',
      },
    });

    if (query?.where?.uniqueEventId && records?.[0]) {
      let liked;
      if (query?.extra?.userId && query?.extra?.userId !== 'undefined') {
        liked = await getRepository(NFTFav).findOne({
          nft: records?.[0],
          user: {
            id: query?.extra.userId,
          },
        });
      }

      const likes = await getRepository(NFTFav).count({
        nft: records?.[0],
      });

      records[0] = {
        ...records?.[0],
        liked,
        likes,
      };
    }

    if (query?.where?.uniqueEventId && records?.[0]) {
      // increment view
      getRepository(NFTOwnerRelation).update(
        {
          id: records?.[0]?.id,
        },
        {
          views: (records?.[0]?.views ?? 0) + 1,
        },
      );
    }

    records = records.map((r) => {
      return {
        ...r,
        marketPlace: marketPlace?.find((m) => {
          return String(m?.tokenId) === String(r?.nftId);
        }),
      };
    });

    if (query?.extra?.forSync === 'true') {
      records = records.filter((r) => {
        // above 343 are IPL nfts
        return parseInt(r?.no, 10) <= 343;
      });
    }

    return {
      total,
      records,
    };
  }

  async favNfts(query: any, id: string) {
    const [records, total] = await getRepository(NFTFav).findAndCount({
      where: {
        user: {
          id,
        },
      },
      relations: query?.relations,
      skip: query?.skip,
      take: query?.take,
    });

    const marketPlace = await getRepository(MarketPlace).find({
      where: {
        nftDetails: In(records?.map((r) => r?.id)),
        typeOfSale: In([
          this.marketplaceService.marketPlaceNFTStatus.ON_SALE,
          this.marketplaceService.marketPlaceNFTStatus.ON_AUCTION,
          this.marketplaceService.marketPlaceNFTStatus.ON_RENT,
        ]),
      },
      order: {
        createDateTime: 'DESC',
      },
    });

    return {
      total,
      records: records.map((r) => {
        return {
          ...r,
          marketPlace: marketPlace?.find((m) => {
            return String(m?.tokenId) === String(r?.nft?.nftId);
          }),
        };
      }),
    };
  }

  async register(params: any, body: any) {
    const userExists = await getRepository(User).findOne({
      accountAddress: Raw(
        (alias) =>
          `LOWER(${alias}) = '${String(params?.accountAddress).toLowerCase()}'`,
      ),
    });

    if (userExists) {
      if (body?.userName) {
        await getRepository(User).update(
          {
            userName: body?.userName,
            profileImage: body?.profileImage,
          },
          {
            id: userExists?.id,
          },
        );
      }
      const payload = {
        username: userExists.userName,
        sub: userExists.accountAddress,
        id: userExists?.id,
      };
      return {
        access_token: this.jwtService.sign(payload),
        ...userExists,
      };
    }

    const saved = await getRepository(User).save({
      accountAddress: params?.accountAddress,
      uniqueEventId: params?.accountAddress,
      userName: body?.userName ?? params?.accountAddress,
      profileImage: body?.profileImage ?? '',
    });
    const payload = {
      username: saved.userName,
      sub: saved.accountAddress,
      id: saved?.id,
    };

    // sync NFT here on registration
    try {
      this.syncMyNFTs(saved, undefined);
    } catch (error) {
      console.log('Error in first sync');
    }

    return {
      access_token: this.jwtService.sign(payload),
      ...saved,
    };
  }

  async toggleFav(body: any, id: string) {
    const nft = await getRepository(NFTOwnerRelation).findOneOrFail({
      nftId: body?.nftId,
    });

    const user = await getRepository(User).findOneOrFail({
      id,
    });

    const exists = await getRepository(NFTFav).findOne({
      nft,
      user,
    });

    if (exists) {
      await getRepository(NFTFav).remove(exists);
      return false;
    }

    await getRepository(NFTFav).save({
      nft,
      user,
    });

    return true;
  }

  async getFollowers(userName: string, userId: string) {
    const user = await getRepository(User).findOneOrFail({
      where: {
        userName,
      },
    });
    const followings = await getRepository(UserFollow).count({
      user,
    });

    const followers = await getRepository(UserFollow).count({
      follows: user,
    });

    const isFollowing = await getRepository(UserFollow).findOne({
      user: {
        id: userId,
      },
      follows: user,
    });

    return { followings, followers, isFollowing: isFollowing?.id };
  }

  async toggleFollow(body: any, id: string) {
    if (body?.follows === id) {
      throw new BadRequestException('You cant follow yourself.');
    }
    const userFollow = await getRepository(UserFollow).findOne({
      where: {
        user: {
          id,
        },
        follows: {
          id: body?.follows,
        },
      },
      relations: ['follows'],
    });

    if (userFollow) {
      await getRepository(UserFollow).remove(userFollow);
      return false;
    }

    const users = await getRepository(User).findByIds([id, body?.follows]);
    await getRepository(UserFollow).save({
      user: users?.find((u) => u?.id === id),
      follows: users?.find((u) => u?.id === body?.follows),
    });
    return true;
  }

  async updateProfile(body: UpdateProfileDTO, user: any) {
    const userExists = await getRepository(User).findOneOrFail({
      id: user?.id,
    });

    if (body?.email) {
      const emailUser = await getRepository(User).findOne({
        email: body?.email,
      });
      if (emailUser && emailUser?.id !== userExists?.id) {
        throw new BadRequestException(
          'Email already exists, please enter another email address.',
        );
      }
    }

    if (body?.userName) {
      const userNameExists = await getRepository(User).findOne({
        userName: body?.userName,
      });
      if (userNameExists && userNameExists?.id !== userExists?.id) {
        throw new BadRequestException(
          'Username already exists, please enter another username.',
        );
      }
    }

    const saved = await getRepository(User).save({
      id: userExists?.id,
      ...body,
    });

    return saved;
  }

  getAttributeValueFromMetaData(metaData, key) {
    return (
      metaData?.attributes?.find((attribute) => attribute?.trait_type === key)
        ?.value ?? ''
    );
  }

  async syncMyNFTs(user: any, body: any) {
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++');
    console.log('+++++++++++++++++++SYNC STARTED++++++++++++++++++++++');
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++');
    const type = {
      Legendary: 1,
      'Super Rare': 2,
      Rare: 3,
      Common: 4,
    };
    const userExists = await getRepository(User).findOneOrFail({
      id: user?.id,
    });

    if (userExists?.internalComment && false) {
      // check for 1 hr interval
      if (moment().diff(moment(userExists?.internalComment), 'hours') < 1) {
        if (body?.code && body?.code === configService.getForceCallCode()) {
          // bypass
        } else {
          throw new BadRequestException(
            `You have done sync recently, Please sync after ${
              60 - moment().diff(moment(userExists?.internalComment), 'minutes')
            } minutes, Thanks.`,
          );
        }
      }
    }

    // save last sync as internalComment
    const time = moment().format();
    await getRepository(User).save({
      id: userExists?.id,
      internalComment: time,
    });

    const ownedNfts = await this.smartContractService.getNFTsForCollection(
      userExists?.accountAddress,
    );

    console.log('ownedNfts', ownedNfts.length);

    const nftsDataFromPackSell = await Promise.all(
      ownedNfts?.map((ownedNft) => {
        const nftId = parseInt(ownedNft?.token_id, 10);
        console.log({ nftId });
        return axios.get(`https://apix.cubixpro.io/nfts/${nftId}`);
      }),
    );

    const savedData = nftsDataFromPackSell?.map((record, index) => {
      const metData = record?.data;
      const category = this.getAttributeValueFromMetaData(metData, 'Category');
      const nftId = parseInt(ownedNfts?.[index]?.token_id, 10);

      const data = {
        no: this.getAttributeValueFromMetaData(metData, 'No'),
        name: this.getAttributeValueFromMetaData(metData, 'Name'),
        country: this.getAttributeValueFromMetaData(metData, 'Country'),
        points: this.getAttributeValueFromMetaData(metData, 'Points'),
        roles: this.getAttributeValueFromMetaData(metData, 'Roles'),
        age: this.getAttributeValueFromMetaData(metData, 'Age'),
        battingStyle: this.getAttributeValueFromMetaData(
          metData,
          'Batting Style',
        ),
        bowlingStyle: this.getAttributeValueFromMetaData(
          metData,
          'Bowling Style',
        ),
        typeId: type?.[category],
        shortName: this.getAttributeValueFromMetaData(metData, 'Short Name'),
        nftId,
        category: category,
      };

      console.log({ metData, data });

      return data;
    });

    // remove owner for this particular owner owned NFTs, will be set again
    await getRepository(NFTOwnerRelation).update(
      {
        currentOwner: String(userExists?.accountAddress).toLowerCase(),
      },
      {
        currentOwner: '',
        user: null,
      },
    );

    for (const nft of ownedNfts) {
      try {
        const nftId = parseInt(nft?.token_id, 10);

        const existingNFT = await getRepository(NFTOwnerRelation).findOne({
          where: [
            {
              nftId,
            },
          ],
        });

        const nftSavedData: any =
          savedData?.find((d) => String(d?.nftId) === String(nftId)) ?? {};

        delete nftSavedData.typeId;
        if (existingNFT) {
          await getRepository(NFTOwnerRelation).update(
            {
              nftId,
            },
            {
              user,
              currentOwner: String(userExists?.accountAddress).toLowerCase(),
              ...nftSavedData,
              id: existingNFT?.id,
            },
          );
        } else {
          await getRepository(NFTOwnerRelation).save({
            user,
            blockchainData: nft?.token_id,
            currentOwner: String(userExists?.accountAddress).toLowerCase(),
            metaData: `https://apix.cubixpro.io/nfts/${nftId}`,
            nftId,
            txHash: nft?.token_id,
            uniqueEventId: nft?.token_id,
            ...nftSavedData,
            id: undefined,
          });
        }
      } catch (error) {
        console.log({ error, nft: JSON.stringify(nft) });
      }
    }

    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++');
    console.log('+++++++++++++++++++SYNC COMPLETED++++++++++++++++++++++');
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++');
    return true;
  }

  async getUserDetails(userName: string) {
    return getRepository(User).findOneOrFail({ userName });
  }

  async subscribe(email: string) {
    try {
      await getRepository(EmailSubscription).save({
        email,
        origin: 'marketplace_homepage',
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  // async getNFTOwners(cursor: string) {
  //   return this.smartContractService.getNFTsForCollection();
  // }

  /**
   * Moralis APIs
   */
  // constructor(private baseURL = 'https://deep-index.moralis.io/api/v2/nft/') {}
  // async syncNFT() {
  //   const lastSyncCursor = await getRepository(Config).findOne({
  //     name: 'nft_cursor',
  //   });
  //   const nftWithOwners = await this.getNFTOwners(lastSyncCursor?.value);
  //   console.log({ nftWithOwners });
  // }
  // async getNFTOwners(cursor: string) {
  //   let result = [];
  //   let url = `${
  //     this.baseURL
  //   }${configService.getContractAddress()}/owners?chain=${configService.getChain()}&format=decimal`;
  //   if (cursor) {
  //     url = `${url}&cursor=${cursor}`;
  //   }
  //   const response = await axios.get(url, {
  //     headers: {
  //       'X-API-Key': configService.getMoralisAPIKey(),
  //     },
  //   });
  //   await getRepository(Config).save({
  //     name: 'nft_cursor',
  //     value: String(response?.data?.cursor),
  //   });
  //   result = [...result, ...response?.data?.result];
  //   if (response?.data?.page_size === 100) {
  //     const data = await this.getNFTOwners(response?.data?.cursor);
  //     if (data) {
  //       result = [...result, ...data];
  //     }
  //   }
  //   return result;
  // }

  async fetchMetadataAndValidatedNFTsForStacking() {
    const response = await axios.get(
      `https://apix.cubixpro.io/api/v1/masters/NFTBasics?select[]=nftId&select[]=typeId&take=1000&skip=0&where[owner]=0x28b111403ec06984f653345d76730452daf97a0f`,
    );

    console.log(response?.data?.data?.total);

    // const notAddedOnStakeContract = await getRepository(
    //   NFTStackedValidated,
    // ).find({
    //   txId: '',
    // });

    const tokenIds = [];
    const categoryIds = [];
    const address = [];

    response?.data?.data?.records?.forEach((d, index) => {
      tokenIds[index] = d?.nftId;
      categoryIds[index] = categoryMapForStaking?.[d?.typeId];
    });

    return {
      tokenIds,
      categoryIds,
      address,
    };
  }

  async getTransferredNFTs() {
    await this.smartContractService.getTransferredNFTs();
    return 'done';
  }

  async getNFTHoldingRewardsRecords(accountAddress: string) {
    const response =
      await this.smartContractService.getNFTHoldingRewardsRecords(
        accountAddress,
      );

    const totalNFTs = await getRepository(NFTOwnerRelation).count({
      where: {
        currentOwner: Raw(
          (alias) =>
            `LOWER(${alias}) = '${String(accountAddress).toLowerCase()}'`,
        ),
      },
    });
    return { ...response, totalNFTs };
  }

  async getNFTHoldingRewards(accountAddress: string) {
    const [records, total] = await getRepository(
      NFTHoldingRewards,
    ).findAndCount({
      select: [
        'holder',
        'nft',
        'isActive',
        'uniqueKey',
        'id',
        'startTimeToConsider',
      ],
      where: {
        isActive: true,
        holder: Raw(
          (alias) =>
            `LOWER(${alias}) = '${String(accountAddress).toLowerCase()}'`,
        ),
      },
    });

    return { records, total };
  }
}
