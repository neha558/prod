import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'marketplace_transactions_history' })
export class MarketPlaceTransactionHistory extends BaseEntity {
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
    type: 'text',
    name: 'tx_hash',
  })
  txHash: string;

  @Column({
    type: 'text',
    name: 'description',
  })
  description: string;

  @Column({
    type: 'bigint',
    name: 'performed_on',
  })
  performedOn: number;
}
