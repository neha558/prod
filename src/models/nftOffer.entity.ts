import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { NFTOfferEntries } from './nftOfferEntries.entity';
import { NFTOwnerRelation } from './nftOwner.entity';
import { User } from './user.entity';

@Entity({ name: 'nft_offer' })
export class NFTOffer extends BaseEntity {
  @ManyToOne(() => User, (user) => user.nftOnSell)
  created_by: User;

  @ManyToOne(() => NFTOwnerRelation, (nft) => nft.sales)
  nft: NFTOwnerRelation;

  @Column({
    type: 'text',
    name: 'name',
  })
  name: string;

  @OneToMany(() => NFTOfferEntries, (nftOfferEntries) => nftOfferEntries.nft)
  offers: NFTOfferEntries[];
}
