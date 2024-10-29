import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity({ name: 'marketplace_nft_offers_records' })
export class MarketplaceNftOffersRecords extends BaseEntity {
  @Column({
    type: 'int',
    name: '_id',
  })
  _id: number;

  @Column({
    type: 'text',
    name: 'owner',
  })
  buyer: string;

  @ManyToOne(() => User, (user) => user.marketplace)
  buyerUser: User;

  @Column({
    type: 'bigint',
    name: 'price',
  })
  price: number;

  @Column({
    type: 'bool',
    name: 'is_accepted',
    default: false,
  })
  isAccepted: boolean;

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
