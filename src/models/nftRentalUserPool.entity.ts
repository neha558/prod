import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'nft_rental_user_pool' })
export class NFTRentalUserPool extends BaseEntity {
  @Column({
    type: 'text',
    name: 'nft_id',
  })
  nftId: string;

  @Column({
    type: 'text',
    name: 'no',
  })
  no: string;

  @Column({
    type: 'text',
    name: 'account_address',
  })
  accountAddress: string;

  @Column({
    type: 'bool',
    name: 'rewarded',
  })
  rewarded: boolean;

  @Column({
    type: 'float',
    name: 'rewards',
  })
  rewards: number;

  @Column({
    type: 'text',
    name: 'reward_tx',
  })
  rewardTx: string;
}
