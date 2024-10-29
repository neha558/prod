import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { NFTOwnerRelation } from './nftOwner.entity';
import { User } from './user.entity';

@Entity({ name: 'marketplace' })
export class MarketPlace extends BaseEntity {
  @Column({
    type: 'int',
    name: '_id',
  })
  _id: number;

  @Column({
    type: 'int',
    name: 'token_id',
  })
  tokenId: number;

  @ManyToOne(() => NFTOwnerRelation, (nft) => nft.marketplace)
  nftDetails: NFTOwnerRelation;

  @Column({
    type: 'text',
    name: 'owner',
  })
  owner: string;

  @ManyToOne(() => User, (user) => user.marketplace)
  ownerUser: User;

  @Column({
    type: 'bigint',
    name: 'price',
  })
  price: number;

  @Column({
    type: 'int',
    name: 'type_of_sale',
  })
  typeOfSale: number;

  @Column({
    type: 'bigint',
    name: 'auction_starts',
  })
  auctionStarts: number;

  @Column({
    type: 'bigint',
    name: 'auction_ends',
  })
  auctionEnds: number;

  @Column({
    type: 'bool',
    name: 'is_usdt',
  })
  isUSDT: number;

  @Column({
    type: 'bigint',
    name: 'per_day_rent',
  })
  perDayRent: number;

  @Column({
    unique: true,
    type: 'text',
    name: 'tx_hash',
  })
  txHash: string;

  @Column({
    type: 'bigint',
    name: 'last_bid',
    default: 0,
  })
  lastBid: number;
}
