import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { NFTHoldingRewardsRecords } from './nftHoldingRewardsTx.entity';

@Entity({ name: 'nft_holding_rewards' })
export class NFTHoldingRewards extends BaseEntity {
  @Column({
    type: 'int',
  })
  nft: number;

  @Column({
    type: 'text',
  })
  holder: string;

  @Column({
    type: 'text',
    name: 'unique_key',
    unique: true,
  })
  uniqueKey: string;

  @Column({
    type: 'float',
    name: 'total_claimable_rewards',
  })
  totalClaimableRewards: number;

  @Column({
    type: 'float',
    name: 'total_claimed_rewards',
  })
  totalClaimedRewards: number;

  @Column({
    type: 'timestamptz',
    name: 'start_time_to_consider',
    default: () => 'CURRENT_TIMESTAMP',
  })
  startTimeToConsider: Date;

  @Column({
    type: 'timestamptz',
    name: 'end_time_to_consider',
    default: () => 'CURRENT_TIMESTAMP',
  })
  endTimeToConsider: Date;

  @OneToMany(() => NFTHoldingRewardsRecords, (n) => n.nftHolding)
  NFTHoldingRewardsRecords: NFTHoldingRewardsRecords[];
}
