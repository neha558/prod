import { configService } from '../../config/config.service';

export const MoaralisAPIBasePath = `https://deep-index.moralis.io/api/v2/${configService.getContractAddress()}/events?chain=${configService.getChain()}&topic=`;
export const MoaralisAPIBasePathForNFTCricket = `https://deep-index.moralis.io/api/v2/${configService.getNFTContractAddress()}/events?chain=${configService.getChain()}&topic=`;
export const MoaralisAPIBasePathForStacking = `https://deep-index.moralis.io/api/v2/${configService.getStackingContractAddress()}/events?chain=${configService.getChain()}&topic=`;
export const MoaralisAPIBasePathForStackingForRewards = `https://deep-index.moralis.io/api/v2/${configService.getStackingRewardContractAddress()}/events?chain=${configService.getChain()}&topic=`;
export const MoaralisAPIBasePathForStackingForRewardsV2 = `https://deep-index.moralis.io/api/v2/${configService.getStackingRewardContractAddressV2()}/events?chain=${configService.getChain()}&topic=`;

export const MoralistNFTsPath = (address) =>
  `https://deep-index.moralis.io/api/v2/${address}/nft?chain=polygon&format=decimal&token_addresses[]=0x6da8a67989cbecbc971d574522081df25416b057&normalizeMetadata=true`;

export const topics = {
  PutBidOnAuction:
    '0xa4eab23476e973ad71776746240a5624452fab62bfc5c8cb9042d15d22191465',
  PutOnMarketPlace:
    '0x0db6e00f14215ec4b04cc2aa90e7a6f599822390a0232b0d3f4a9e15920f144a',
  OfferAccepted:
    '0x8f414bb7b1129208b5a842a85f18292a47ad72117cca38e4363cf80dc189ec16',
  PutOfferOnSale:
    '0x37b7db0471d3cc2684c72940c112bbc9a4fb405c6d5918f040900a344b9e8f8a',
  BuyNFT: '0xee4cad3a83cfbdae195c03db4121913b9902e613bee1485e118dbad6864503d1',
  RentedNFT: '',
  AuctionWinnerDeclared:
    '0xe965867540b0c2f100112e335cdff16808c17a6dec6d54cf8675788ec0bd44f4',
  NFTStaked:
    '0x707e156505e5328341139a5b9044a1e5dc7b46fcd24c9c0730c5c60422d951a9',
  NFTUnstaked: '',
  NFTCategoryValidated: '',
  Claimed: '',
  NFT_TRANSFER:
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  ClaimRequested:
    '0x6ae5c639e457ed21b1bc31c5e34944d0d798892e886756be38a7bf808170ba26',
  ClaimedV2:
    '0x987d620f307ff6b94d58743cb7a7509f24071586a77759b77c2d4e29f75a2f9a',
};

export const topicsABIs = {
  PutBidOnAuction: {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'marketPlaceId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'bidder',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'time',
        type: 'uint256',
      },
    ],
    name: 'PutBidOnAuction',
    type: 'event',
  },
  PutOnMarketPlace: {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'enum CubixMarketPlace.MarketPlaceNFTType',
        name: 'typeOfSale',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'auctionStarts',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'auctionEnds',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isUSDT',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'perDayRent',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'time',
        type: 'uint256',
      },
    ],
    name: 'PutOnMarketPlace',
    type: 'event',
  },
  OfferAccepted: {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'marketPlaceId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'buyer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'time',
        type: 'uint256',
      },
    ],
    name: 'OfferAccepted',
    type: 'event',
  },
  PutOfferOnSale: {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'marketPlaceId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'buyer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'time',
        type: 'uint256',
      },
    ],
    name: 'PutOfferOnSale',
    type: 'event',
  },
  BuyNFT: {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'buyer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'time',
        type: 'uint256',
      },
    ],
    name: 'BuyNFT',
    type: 'event',
  },
  AuctionWinnerDeclared: {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'marketPlaceId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'winner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'time',
        type: 'uint256',
      },
    ],
    name: 'AuctionWinnerDeclared',
    type: 'event',
  },
  RentedNFT: {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'rental',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'starts',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'ends',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'time',
        type: 'uint256',
      },
    ],
    name: 'RentedNFT',
    type: 'event',
  },
  NFTStaked: {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'counter',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'nftCategory',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'rates',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'stackedOn',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'ends',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isCategoryVerified',
        type: 'bool',
      },
    ],
    name: 'NFTStaked',
    type: 'event',
  },
  NFTUnstaked: {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'counter',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'stakingTime',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'stakingReward',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'totalReward',
        type: 'uint256',
      },
    ],
    name: 'NFTUnstaked',
    type: 'event',
  },
  NFTCategoryValidated: {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'NFTCategoryValidated',
    type: 'event',
  },
  Claimed: {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Claimed',
    type: 'event',
  },
  NFT_TRANSFER: {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  ClaimRequested: {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'counter',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'requester',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'time',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isFullfiled',
        type: 'bool',
      },
    ],
    name: 'ClaimRequested',
    type: 'event',
  },
  ClaimedV2: {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'time',
        type: 'uint256',
      },
    ],
    name: 'Claimed',
    type: 'event',
  },
};

export const topicsABIsMap = {
  [topics.PutBidOnAuction]: topicsABIs.PutBidOnAuction,
  [topics.PutOnMarketPlace]: topicsABIs.PutOnMarketPlace,
  [topics.OfferAccepted]: topicsABIs.OfferAccepted,
  [topics.PutOfferOnSale]: topicsABIs.PutOfferOnSale,
  [topics.BuyNFT]: topicsABIs.BuyNFT,
  [topics.RentedNFT]: topicsABIs.RentedNFT,
  [topics.AuctionWinnerDeclared]: topicsABIs.AuctionWinnerDeclared,
  [topics.NFTStaked]: topicsABIs.NFTStaked,
  [topics.NFTUnstaked]: topicsABIs.NFTUnstaked,
  [topics.NFTCategoryValidated]: topicsABIs.NFTCategoryValidated,
  [topics.Claimed]: topicsABIs.Claimed,
  [topics.NFT_TRANSFER]: topicsABIs.NFT_TRANSFER,
  [topics.ClaimRequested]: topicsABIs.ClaimRequested,
  [topics.ClaimedV2]: topicsABIs.ClaimedV2,
};
