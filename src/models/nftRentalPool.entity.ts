import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'nfts_rental_pool' })
export class NFTRentalPool extends BaseEntity {
  @Column({
    type: 'text',
    name: 'no',
    unique: true,
  })
  no: string;

  @Column({
    type: 'int',
    name: 'counter',
  })
  counter: number;

  @Column({
    type: 'int',
    name: 'used',
  })
  used: number;

  @Column({
    type: 'float',
    name: 'rewards',
  })
  rewards: number;
}
