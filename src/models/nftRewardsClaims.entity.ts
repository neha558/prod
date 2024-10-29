import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'nft_rewards_claims' })
export class NFTRewardsClaims extends BaseEntity {
  @Column({
    type: 'text',
    name: 'account_address',
  })
  accountAddress: string;

  @Column({
    type: 'text',
    name: 'tx_hash',
  })
  txHash: string;

  @Column({
    type: 'text',
    name: 'amount',
    default: 0,
  })
  amount: string;
}
