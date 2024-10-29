import { Injectable } from '@nestjs/common';
import { NFTOwnerRelation } from 'src/models/nftOwner.entity';
import { NFTRentalPool } from 'src/models/nftRentalPool.entity';
import { NFTRentalUserPool } from 'src/models/nftRentalUserPool.entity';
import { getRepository, In } from 'typeorm';

@Injectable()
export class NftsRentalService {
  async setNFTForPool(data) {
    const nftIds = String(data?.nftsIds).split(',');

    const nfts = await getRepository(NFTOwnerRelation).find({
      nftId: In(nftIds.map((nftId) => parseInt(nftId, 10))),
      isAddedInRentalPool: false,
    });

    await getRepository(NFTOwnerRelation).update(
      {
        nftId: In(nftIds.map((nftId) => parseInt(nftId, 10))),
      },
      {
        isAddedInRentalPool: true,
      },
    );

    const existingRentalPool = await getRepository(NFTRentalPool).find({
      no: In(nfts.map((nft) => nft.no)),
    });

    const savingData = nfts?.map((nft) => {
      const existing = existingRentalPool?.find((e) => e?.no === nft.no);
      return {
        id: existing?.id,
        counter: existing?.id ? existing?.counter + 1 : 1,
        no: nft.no,
        rewards: existing?.id ? existing?.rewards : 0,
        used: existing?.used ? existing?.used : 0,
      };
    });

    await getRepository(NFTRentalPool).save(savingData);

    await getRepository(NFTRentalUserPool).save(
      nfts.map((nft) => {
        return {
          accountAddress: nft.currentOwner,
          nftId: String(nft.nftId),
          no: nft.no,
          rewarded: false,
          rewards: 0,
          rewardTx: '',
        };
      }),
    );

    return true;
  }

  async getNFTForPool(query) {
    const [records, total] = await getRepository(NFTRentalPool).findAndCount(
      query,
    );

    return { records, total };
  }

  async updateNFTForPool(body) {
    const nftPool = await getRepository(NFTRentalPool).findOneOrFail({
      no: body?.no,
    });

    const saved = await getRepository(NFTRentalPool).save({
      ...nftPool,
      id: nftPool.id,
      used: body?.used,
      rewards: body?.rewards,
    });

    // update owner nft table
    if (body?.nftId) {
      await getRepository(NFTOwnerRelation).update(
        {
          nftId: body?.nftId,
        },
        {
          isAddedInRentalPool: body?.isAddedInRentalPool,
        },
      );
    }

    if (body?.rewards) {
      const nftUserPool = await getRepository(NFTRentalUserPool).find({
        no: body?.no,
        rewards: 0,
        rewarded: false,
      });

      const portion = body?.rewards / nftUserPool?.length;
      await getRepository(NFTRentalUserPool).update(
        {
          id: In(nftUserPool?.map((_nftUserPool) => _nftUserPool?.id)),
        },
        {
          rewards: portion,
        },
      );

      // added entry in NFTRentalUserPool
    }

    return saved;
  }

  async getNFTForPoolOfUser(query) {
    const [records, total] = await getRepository(
      NFTRentalUserPool,
    ).findAndCount(query);

    return { records, total };
  }
}
