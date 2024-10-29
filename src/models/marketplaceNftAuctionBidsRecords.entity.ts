import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity({ name: 'marketplace_nft_auction_records' })
export class MarketplaceNftAuctionBidsRecords extends BaseEntity {
  @Column({
    type: 'int',
    name: '_id',
  })
  _id: number;

  @Column({
    type: 'text',
    name: 'owner',
  })
  bidder: string;

  @ManyToOne(() => User, (user) => user.marketplace)
  bidderUser: User;

  @Column({
    type: 'bigint',
    name: 'price',
  })
  price: number;

  @Column({
    type: 'bool',
    name: 'is_winner',
    default: false,
  })
  isWinner: boolean;

  @Column({
    name: 'status',
    default: 'pending',
  })
  status: string;

  @Column({
    unique: true,
    type: 'text',
    name: 'tx_hash',
  })
  txHash: string;
}
