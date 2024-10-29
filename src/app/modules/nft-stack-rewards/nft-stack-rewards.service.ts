import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as moment from 'moment';
import { getRepository } from 'typeorm';

import { SmartContractService } from 'src/app/services/smart-contract/smart-contract.service';
import { Stackers } from 'src/models/stackers.entity';
import { StackersTokenId } from 'src/models/stackersTokenIds.entity';
import { configService } from 'src/app/config/config.service';

@Injectable()
export class NftStackRewardsService {
  constructor(private smartContractService: SmartContractService) {}

  stakingTimeInHours = 24;
  rewardTokens = 2;

  firstFreeNFTId = 35755;
  lastFreeNFTId = 47556;

  async stackerDetails(accountAddress: string) {
    const stacker = await this.addOrCheckStacker(accountAddress);
    return stacker;
  }

  isFreeNFT(nftId) {
    return nftId >= this.firstFreeNFTId && nftId <= this.lastFreeNFTId;
  }

  async stake(accountAddress: string) {
    const tokenIds = await this.smartContractService.getNFTsForCollection(
      accountAddress,
    );
    const stacker = await this.addOrCheckStacker(accountAddress);
    for (const tokenId of tokenIds) {
      const nftId = parseInt(tokenId?.token_id, 10);
      await this.addOrCheckStackerTokenId(stacker, nftId);
    }
    return true;
  }

  async syncRewards(accountAddress: string) {
    const stacker = await this.addOrCheckStacker(accountAddress);
    const tokenIdsAvailable =
      await this.smartContractService.getNFTsForCollection(accountAddress);

    const tokenIds = await getRepository(StackersTokenId).find({
      stacker,
      isActive: true,
      isArchived: false,
    });

    const now = moment();
    for (const tokenId of tokenIds) {
      // check owner if changed remove from token ids
      if (
        !tokenIdsAvailable?.some((t) => {
          const nftId = parseInt(t?.token_id, 10);
          return tokenId.token_id === nftId;
        })
      ) {
        await getRepository(StackersTokenId).delete({ id: tokenId.id });
        continue;
      }

      if (
        tokenId.token_staking_time &&
        now.isSameOrAfter(
          moment(Number(tokenId.token_staking_time)).add(
            this.stakingTimeInHours,
            'hours',
          ),
        )
      ) {
        // const stakedDays = now.diff(moment(tokenId.token_staking_time), 'days');
        const stakedDays = 1; // so every day user have to click on sync
        stacker.balance = stacker.balance + this.rewardTokens * stakedDays;
        stacker.lastSyncOn = String(moment().startOf('date').valueOf());

        // const partialTimeInHours =
        //   now.diff(moment(tokenId.token_staking_time), 'hours') %
        //   this.stakingTimeInHours;

        // tokenId.token_staking_time = String(
        //   now.subtract(partialTimeInHours, 'hours').valueOf(),
        // );

        tokenId.token_staking_time = String(moment().startOf('date').valueOf());

        await getRepository(Stackers).save(stacker);
        await getRepository(StackersTokenId).save(tokenId);
      }
    }
  }

  async claim(accountAddress: string, headers) {
    if (headers?.['x-api-key'] !== configService.getRentalAPICallKey()) {
      throw new UnauthorizedException('Not valid api key');
    }
    const stacker = await this.addOrCheckStacker(accountAddress);
    stacker.rewardsReleased = stacker.balance;
    stacker.balance = 0;
    await getRepository(Stackers).save(stacker);
    return true;
  }

  async addOrCheckStacker(accountAddress: string) {
    const exists = await getRepository(Stackers).findOne({
      accountAddress,
    });

    if (exists) {
      return exists;
    }

    const saved = await getRepository(Stackers).save({
      accountAddress,
      balance: 0,
      rewardsReleased: 0,
      lastSyncOn: String(moment().startOf('date').valueOf()),
    });

    return saved;
  }

  async addOrCheckStackerTokenId(stacker, tokenId) {
    if (this.isFreeNFT(tokenId)) {
      return;
    }
    const exists = await getRepository(StackersTokenId).findOne({
      stacker,
      token_id: tokenId,
    });

    if (exists) {
      return exists;
    }

    const saved = await getRepository(StackersTokenId).save({
      stacker,
      token_id: tokenId,
      token_staking_time: String(moment().startOf('date').valueOf()),
    });

    return saved;
  }
}
