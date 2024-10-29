import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { NFTAuctionBid } from './nftAuctionBids.entity';
import { NFTOwnerRelation } from './nftOwner.entity';
import { User } from './user.entity';

@Entity({ name: 'nft_auction' })
export class NFTAuction extends BaseEntity {
  @ManyToOne(() => User, (user) => user.nftOnAuction)
  created_by: User;

  @ManyToOne(() => NFTOwnerRelation, (nft) => nft.sales)
  nft: NFTOwnerRelation;

  @Column({
    type: 'float',
    default: 0,
    name: 'starting_price',
  })
  starting_price: number;

  @Column({
    type: 'float',
    default: 0,
    name: 'bid_increment_price',
  })
  bid_increment_price: number;

  @Column({
    type: 'text',
    name: 'name',
  })
  name: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  start_date: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  end_date: Date;

  @OneToMany(() => NFTAuctionBid, (nftAuctionBid) => nftAuctionBid.auction)
  bids: NFTAuctionBid[];
}
