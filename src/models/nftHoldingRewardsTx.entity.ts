import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { NFTHoldingRewards } from './nftHoldingRewards.entity';

@Entity({ name: 'nft_holding_rewards_records' })
export class NFTHoldingRewardsRecords extends BaseEntity {
  @ManyToOne(() => NFTHoldingRewards, (nft) => nft.NFTHoldingRewardsRecords)
  nftHolding: NFTHoldingRewards;

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

  // nftHolding?.id_${YYYYMMDD} (date of reward cron run)
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
    type: 'int',
    name: 'total_supply',
  })
  totalSupply: number;

  @Column({
    type: 'text',
    name: 'type_of_card',
  })
  typeOfCard: string;

  @Column({
    type: 'text',
    name: 'request_id',
    nullable: true,
  })
  requestId: string;

  @Column({
    type: 'text',
    name: 'tx_id',
    nullable: true,
  })
  txId: string;
}
