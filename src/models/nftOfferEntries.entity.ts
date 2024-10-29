import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { NFTOffer } from './nftOffer.entity';
import { NFTOwnerRelation } from './nftOwner.entity';
import { User } from './user.entity';

@Entity({ name: 'nft_offer_entries' })
export class NFTOfferEntries extends BaseEntity {
  @ManyToOne(() => NFTOffer, (offer) => offer.offers)
  offer: NFTOffer;

  @ManyToOne(() => User, (user) => user.nftOnOfferDoneByMe)
  created_by: User;

  @ManyToOne(() => User, (user) => user.nftOnOfferDoneForMe)
  created_for: User;

  @ManyToOne(() => NFTOwnerRelation, (nft) => nft.sales)
  nft: NFTOwnerRelation;

  @Column({
    type: 'float',
    name: 'price',
  })
  price: number;

  @Column({
    type: 'boolean',
    name: 'accepted',
    default: false,
  })
  accepted: boolean;
}
