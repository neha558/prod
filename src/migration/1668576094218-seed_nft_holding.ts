import axios from 'axios';
import * as moment from 'moment';
import { rewardDeltaInHours } from 'src/app/config/app.constants';
import { configService } from 'src/app/config/config.service';
import {
  MoaralisAPIBasePathForNFTCricket,
  topics,
  topicsABIs,
} from 'src/app/services/smart-contract/marketplace.contants';
import { Config } from 'src/models/config.entity';
import { NFTHoldingRewards } from 'src/models/nftHoldingRewards.entity';
import { NFTHoldingRewardsRecords } from 'src/models/nftHoldingRewardsTx.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';

axios.defaults.headers['X-API-Key'] = configService.getMoralisAPIKey();

export class seedNftHolding1668576094218 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('NFT holding seeding started...');

    await queryRunner.manager
      .getRepository(NFTHoldingRewardsRecords)
      .delete({});
    await queryRunner.manager.getRepository(NFTHoldingRewards).delete({});
    await queryRunner.manager
      .getRepository(Config)
      .delete({ name: 'NFT_TRANSFER_BLOCK' });

    console.log('Cleanup DB...');

    const starts = moment(parseInt(configService.getRewardStartDate(), 10));

    console.log({ starts: starts.format() });
    const lastBlock = await this.getLastBlockFetchedForEvents(
      'NFT_TRANSFER_BLOCK',
      queryRunner,
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

        if (calls === 0 && response?.data?.result?.[0]?.block_number) {
          await this.setLastBlockFetchedForEvents(
            response?.data?.result?.[0]?.block_number,
            'NFT_TRANSFER_BLOCK',
            queryRunner,
          );
        }

        const data = response?.data?.result;
        for (const transferEvent of data) {
          // start Time to consider
          const startTimeToConsider = moment(starts);
          const endTimeToConsider = moment(startTimeToConsider).add(
            rewardDeltaInHours,
            'hours',
          );

          const uniqueKey = `${transferEvent?.data?.tokenId}_${transferEvent?.data?.from}_${transferEvent?.data?.to}_${transferEvent?.block_number}`;

          // update prev entered record as inactivate for rewards
          const exists = await queryRunner.manager
            .getRepository(NFTHoldingRewards)
            .findOne({
              select: ['id'],
              where: {
                nft: parseInt(transferEvent?.data?.tokenId, 10),
              },
            });

          try {
            await queryRunner.manager.getRepository(NFTHoldingRewards).save({
              holder: transferEvent?.data?.to,
              nft: parseInt(transferEvent?.data?.tokenId, 10),
              uniqueKey,
              startTimeToConsider: startTimeToConsider.format(),
              endTimeToConsider: endTimeToConsider.format(),
              totalClaimableRewards: 0,
              totalClaimedRewards: 0,
              isActive: exists?.id ? false : true,
            });
          } catch (error) {
            // silent error if duplicate entry tried to be entered
          }
        }

        calls++;

        console.log([url, calls]);

        offset = offset + 100;
      } catch (error) {
        console.log(error);
      }
    } while (response?.data?.result?.length > 0);
  }

  async setLastBlockFetchedForEvents(
    lastBlock: string,
    eventName: string,
    queryRunner,
  ) {
    if (!lastBlock) {
      return;
    }
    const exist = await queryRunner.manager.getRepository(Config).findOne({
      name: eventName,
    });

    await queryRunner.manager.getRepository(Config).save({
      id: exist?.id,
      name: eventName,
      value: String(parseInt(lastBlock, 10) + 1),
    });

    return;
  }

  async getLastBlockFetchedForEvents(eventName: string, queryRunner) {
    const exist = await queryRunner.manager.getRepository(Config).findOne({
      name: eventName,
    });

    return exist?.value;
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
