import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { NFTSale } from './nftSale.entity';
import { NFTAuction } from './nftAuction.entity';
import { NFTOffer } from './nftOffer.entity';
import { NFTOfferEntries } from './nftOfferEntries.entity';
import { NFTAuctionBid } from './nftAuctionBids.entity';
import { NFTOwnerRelation } from './nftOwner.entity';
import { NFTFav } from './nftFav.entity';
import { UserFollow } from './userFollow.entity';
import { MarketPlace } from './marketplaceRecords.entity';
import { MarketplaceNftAuctionBidsRecords } from './marketplaceNftAuctionBidsRecords.entity';
import { MarketplaceNftOffersRecords } from './marketplaceNftOffersRecords.entity';
import { MarketplaceNftRentRecords } from './marketplaceNftRentRecords.entity';
import { NFTStacked } from './nftStacked.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({
    type: 'text',
    name: 'account_address',
    unique: true,
  })
  accountAddress: string;

  @Column({
    type: 'text',
    name: 'user_name',
    unique: true,
    nullable: true,
  })
  userName: string;

  @Column({
    type: 'text',
    name: 'profile_image',
    nullable: true,
  })
  profileImage: string;

  @Column({
    type: 'text',
    name: 'unique_event_id',
    unique: true,
    nullable: true,
  })
  uniqueEventId: string;

  @OneToMany(() => NFTOwnerRelation, (nft) => nft.user)
  nfts: NFTOwnerRelation[];

  @OneToMany(() => NFTSale, (directSell) => directSell.user)
  nftOnSell: NFTSale[];

  @OneToMany(() => NFTSale, (directSell) => directSell.newOwner)
  nftBought: NFTSale[];

  @OneToMany(() => NFTAuction, (nftAuction) => nftAuction.created_by)
  nftOnAuction: NFTAuction[];

  @OneToMany(() => NFTOffer, (nftOffer) => nftOffer.created_by)
  nftOnOffer: NFTOffer[];

  @OneToMany(() => NFTOfferEntries, (nftOffer) => nftOffer.created_by)
  nftOnOfferDoneByMe: NFTOfferEntries[];

  @OneToMany(() => NFTOfferEntries, (nftOffer) => nftOffer.created_for)
  nftOnOfferDoneForMe: NFTOfferEntries[];

  @OneToMany(() => NFTAuctionBid, (nftAuctionBid) => nftAuctionBid.created_by)
  nftAuctionDoneByMe: NFTAuctionBid[];

  @OneToMany(() => NFTFav, (nftFav) => nftFav.user)
  favNFTs: NFTFav[];

  // additional fields
  @Column({
    type: 'text',
    name: 'full_name',
    nullable: true,
  })
  fullName: string;

  @Column({
    type: 'text',
    name: 'email',
    nullable: true,
    unique: true,
  })
  email: string;

  @Column({
    type: 'text',
    name: 'bio',
    nullable: true,
  })
  bio: string;

  @Column({
    type: 'text',
    name: 'fb_link',
    nullable: true,
  })
  fbLink: string;

  @Column({
    type: 'text',
    name: 'instagram_link',
    nullable: true,
  })
  instagramLink: string;

  @Column({
    type: 'text',
    name: 'twitter_link',
    nullable: true,
  })
  twitterLink: string;

  @OneToMany(() => UserFollow, (userFollow) => userFollow.user)
  following: UserFollow[];

  @OneToMany(() => UserFollow, (userFollow) => userFollow.follows)
  followers: UserFollow[];

  @OneToMany(() => MarketPlace, (marketplace) => marketplace.ownerUser)
  marketplace: MarketPlace[];

  @OneToMany(
    () => MarketplaceNftAuctionBidsRecords,
    (marketplaceNftAuctionBidsRecords) =>
      marketplaceNftAuctionBidsRecords.bidderUser,
  )
  marketplaceNftAuctionBidsRecords: MarketplaceNftAuctionBidsRecords[];

  @OneToMany(
    () => MarketplaceNftOffersRecords,
    (marketplaceNftOffersRecords) => marketplaceNftOffersRecords.buyerUser,
  )
  marketplaceNftOffersRecords: MarketplaceNftOffersRecords[];

  @OneToMany(
    () => MarketplaceNftRentRecords,
    (marketplaceNftRentRecords) => marketplaceNftRentRecords.rentalUser,
  )
  marketplaceNftRentRecords: MarketplaceNftRentRecords[];

  @OneToMany(() => NFTStacked, (nftStacked) => nftStacked.stacked_by)
  stackedNFTs: NFTStacked[];
}
