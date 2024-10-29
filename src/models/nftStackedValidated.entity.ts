import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'nft_stacked_validated' })
export class NFTStackedValidated extends BaseEntity {
  @Column({
    type: 'int',
  })
  categoryId: number;

  @Column({
    type: 'int',
    unique: true,
  })
  tokenId: number;

  @Column({
    type: 'text',
  })
  txId: string;
}
