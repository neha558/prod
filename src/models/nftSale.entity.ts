import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { NFTOwnerRelation } from './nftOwner.entity';
import { User } from './user.entity';

@Entity({ name: 'nft_sales' })
export class NFTSale extends BaseEntity {
  @ManyToOne(() => User, (user) => user.nftOnSell)
  user: User;

  @ManyToOne(() => NFTOwnerRelation, (nft) => nft.sales)
  nft: NFTOwnerRelation;

  @Column({
    type: 'float',
    default: 0,
    name: 'price',
  })
  price: number;

  @ManyToOne(() => User, (user) => user.nftBought)
  newOwner: User;

  @Column({
    type: 'text',
    unique: true,
    name: 'sell_tx',
  })
  sell_tx: string;

  @Column({
    type: 'boolean',
    default: false,
    name: 'sold',
  })
  sold: boolean;

  @Column({
    type: 'text',
    unique: true,
    name: 'sell_type',
  })
  sell_type: 'direct' | 'auction' | 'offer';

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  sold_on: Date;
}
