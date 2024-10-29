import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MarketPlace } from './marketplaceRecords.entity';
import { NFTAuction } from './nftAuction.entity';
import { NFTFav } from './nftFav.entity';
import { NFTSale } from './nftSale.entity';
import { NFTStacked } from './nftStacked.entity';
import { User } from './user.entity';

@Entity({ name: 'nft_owners_relation' })
export class NFTOwnerRelation extends BaseEntity {
  @ManyToOne(() => User, (user) => user.nfts)
  user: User;

  @Column({
    type: 'text',
    name: 'current_owner',
    nullable: true,
  })
  currentOwner: string;

  @Column({
    type: 'int',
    unique: true,
    name: 'nft_id',
  })
  nftId: number;

  @Column({
    type: 'text',
    name: 'tx_hash',
  })
  txHash: string;

  @Column({
    type: 'text',
    name: 'unique_event_id',
    unique: true,
  })
  uniqueEventId: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'blockchain_data',
  })
  blockchainData: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'meta_data',
  })
  metaData: string;

  @Column({
    type: 'int',
    name: 'views',
    default: 0,
  })
  views: number;

  @OneToMany(() => NFTSale, (sales) => sales.nft)
  sales: NFTSale[];

  @OneToMany(() => NFTAuction, (auction) => auction.nft)
  inAuction: NFTAuction[];

  @OneToMany(() => NFTFav, (nftFav) => nftFav.nft)
  favNFTs: NFTFav[];

  @OneToMany(() => MarketPlace, (marketplace) => marketplace.nftDetails)
  marketplace: MarketPlace[];

  @Column({
    type: 'text',
    name: 'no',
    nullable: true,
  })
  no: string;

  @Column({
    type: 'text',
    name: 'name',
    nullable: true,
  })
  name: string;

  @Column({
    type: 'text',
    name: 'short_name',
    nullable: true,
  })
  shortName: string;

  @Column({
    type: 'text',
    name: 'country',
    nullable: true,
  })
  country: string;

  @Column({
    type: 'text',
    name: 'points',
    nullable: true,
  })
  points: string;

  @Column({
    type: 'text',
    name: 'roles',
    nullable: true,
  })
  roles: string;

  @Column({
    type: 'text',
    name: 'age',
    nullable: true,
  })
  age: string;

  @Column({
    type: 'text',
    name: 'batting_style',
    nullable: true,
  })
  battingStyle: string;

  @Column({
    type: 'text',
    name: 'bowling_style',
    nullable: true,
  })
  bowlingStyle: string;

  @Column({
    type: 'text',
    name: 'category',
    nullable: true,
  })
  category: string;

  @OneToMany(() => NFTStacked, (nftStacked) => nftStacked.nft)
  staked: NFTStacked[];

  @Column({
    type: 'bool',
    name: 'is_added_in_rental_pool',
    default: false,
  })
  isAddedInRentalPool: boolean;
}
