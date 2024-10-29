import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { NFTAuction } from './nftAuction.entity';
import { User } from './user.entity';

@Entity({ name: 'nft_auction_bids' })
export class NFTAuctionBid extends BaseEntity {
  @ManyToOne(() => NFTAuction, (nftAuction) => nftAuction.bids)
  auction: NFTAuction;

  @ManyToOne(() => User, (user) => user.nftAuctionDoneByMe)
  created_by: User;

  @Column({
    type: 'float',
    default: 0,
    name: 'bid',
  })
  bid: number;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_winner',
  })
  isWinner: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  winner_declared_on: Date;
}
