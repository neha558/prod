import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { NFTOwnerRelation } from './nftOwner.entity';
import { User } from './user.entity';

@Entity({ name: 'nft_stacked' })
export class NFTStacked extends BaseEntity {
  @ManyToOne(() => User, (user) => user.stackedNFTs)
  stacked_by: User;

  @ManyToOne(() => NFTOwnerRelation, (nft) => nft.sales)
  nft: NFTOwnerRelation;

  @Column({
    type: 'int',
    unique: true,
  })
  counter: number;

  @Column({
    type: 'text',
    unique: true,
  })
  txId: string;

  @Column({
    type: 'float',
  })
  rates: number;

  @Column({
    type: 'timestamptz',
    name: 'stacked_on',
  })
  stackedOn: Date;

  @Column({
    type: 'timestamptz',
    name: 'ends',
  })
  ends: Date;

  @Column({
    type: 'boolean',
    name: 'is_category_verified',
  })
  isCategoryVerified: boolean;

  @Column({
    type: 'int',
    default: 0,
  })
  stakingTime: number;

  @Column({
    type: 'int',
    default: 0,
  })
  totalReward: number;
}
