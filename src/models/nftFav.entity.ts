import { Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { NFTOwnerRelation } from './nftOwner.entity';
import { User } from './user.entity';

@Entity({ name: 'nft_fav' })
export class NFTFav extends BaseEntity {
  @ManyToOne(() => User, (user) => user.favNFTs)
  user: User;

  @ManyToOne(() => NFTOwnerRelation, (nft) => nft.favNFTs)
  nft: NFTOwnerRelation;
}
