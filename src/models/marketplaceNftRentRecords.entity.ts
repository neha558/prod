import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity({ name: 'marketplace_nft_rent_records' })
export class MarketplaceNftRentRecords extends BaseEntity {
  @Column({
    type: 'int',
    name: '_id',
  })
  _id: number;

  @Column({
    type: 'text',
    name: 'rental',
  })
  rental: string;

  @ManyToOne(() => User, (user) => user.marketplace)
  rentalUser: User;

  @Column({
    type: 'bigint',
    name: 'price',
  })
  price: number;

  @Column({
    type: 'bigint',
    name: 'starts',
  })
  starts: number;

  @Column({
    type: 'bigint',
    name: 'ends',
  })
  ends: number;

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
