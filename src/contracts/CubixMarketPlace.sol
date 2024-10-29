// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, 'SafeMath: addition overflow');
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, 'SafeMath: subtraction overflow');
        uint256 c = a - b;
        return c;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        require(c / a == b, 'SafeMath: multiplication overflow');
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0, 'SafeMath: division by zero');
        uint256 c = a / b;
        return c;
    }
}

interface ERC721 {
    function ownerOf(uint256 tokenId) external view returns (address owner);

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata data
    ) external;

    function getApproved(uint256 tokenId)
        external
        view
        returns (address operator);
}

interface ERC20 {
    function mint(address reciever, uint256 value) external returns (bool);

    function transfer(address to, uint256 value) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);

    function balanceOf(address tokenOwner)
        external
        view
        returns (uint256 balance);

    function allowance(address _owner, address spender)
        external
        view
        returns (uint256);
}

contract CubixMarketPlace {
    using SafeMath for uint256;

    modifier onlyOwner() {
        require(msg.sender == ownerAddress, 'Only owner');
        _;
    }

    constructor(
        address _nftAddress,
        address _usdtAddress,
        address _cubixAddress
    ) {
        ownerAddress = payable(msg.sender);
        setlletmentAddress = payable(msg.sender);
        nft = ERC721(_nftAddress);
        usdt = ERC20(_usdtAddress);
        cubixToken = ERC20(_cubixAddress);
    }

    ERC721 public nft;
    ERC20 public usdt;
    ERC20 public cubixToken;
    address payable public ownerAddress;
    address payable public setlletmentAddress;

    mapping(uint256 => address) public royaltyOwners;
    uint256 royaltyAmountPercentage = 5;
    uint256 companyAmountPercentage = 2;

    enum MarketPlaceNFTType {
        NOT_ON_SALE, // 0
        ON_SALE, // 1
        ON_AUCTION, // 2
        ON_RENT, // 3
        REMOVED // 4
    }

    // set index for events
    event PutOnMarketPlace(
        uint256 id,
        uint256 tokenId,
        address owner,
        uint256 price,
        MarketPlaceNFTType typeOfSale,
        uint256 auctionStarts,
        uint256 auctionEnds,
        bool isUSDT,
        uint256 perDayRent,
        uint256 time
    );

    event PutBidOnAuction(
        uint256 marketPlaceId,
        uint256 tokenId,
        address bidder,
        uint256 price,
        uint256 time
    );

    event PutOfferOnSale(
        uint256 marketPlaceId,
        uint256 tokenId,
        address buyer,
        uint256 price,
        uint256 time
    );

    event OfferAccepted(
        uint256 marketPlaceId,
        uint256 tokenId,
        address buyer,
        uint256 price,
        uint256 time
    );

    event BuyNFT(
        uint256 tokenId,
        address owner,
        address buyer,
        uint256 price,
        uint256 time
    );
    event RentedNFTFinished(uint256 tokenId, uint256 time);

    event RentedNFT(
        uint256 tokenId,
        address owner,
        address rental,
        uint256 price,
        uint256 starts,
        uint256 ends,
        uint256 time
    );

    event AuctionWinnerDeclared(
        uint256 marketPlaceId,
        uint256 tokenId,
        address owner,
        address winner,
        uint256 price,
        uint256 time
    );

    struct MarketPlaceNFT {
        uint256 id;
        uint256 tokenId;
        address payable owner;
        uint256 price;
        MarketPlaceNFTType typeOfSale;
        uint256 auctionStarts;
        uint256 auctionEnds;
        bool isUSDT;
        uint256 perDayRent;
    }

    struct NFTBid {
        address bidder;
        uint256 price;
    }

    struct NFTOffer {
        address buyer;
        uint256 price;
    }

    struct NFTRent {
        address rental;
        uint256 price;
        uint256 starts;
        uint256 ends;
    }

    uint256 marketPlaceId = 17;
    mapping(uint256 => MarketPlaceNFT) public marketplace;
    mapping(uint256 => MarketPlaceNFT) public marketplaceRecords;

    mapping(uint256 => mapping(address => uint256)) public nftAuctionBids;
    mapping(uint256 => mapping(address => uint256)) public nftOffers;
    mapping(uint256 => NFTBid[]) public nftAuctionBidsRecords;
    mapping(uint256 => NFTOffer[]) public nftOffersRecords;
    mapping(uint256 => mapping(address => NFTRent)) public nftRentRecords;
    mapping(uint256 => uint256) public rentedNFTs;

    function _beforePuttinOnMarketPlace(uint256 tokenId, uint256 price)
        internal
        view
    {
        require(
            nft.ownerOf(tokenId) == msg.sender &&
                nft.getApproved(tokenId) == address(this) &&
                (marketplace[tokenId].typeOfSale ==
                    MarketPlaceNFTType.REMOVED ||
                    marketplace[tokenId].typeOfSale ==
                    MarketPlaceNFTType.NOT_ON_SALE) &&
                price > 0,
            'You are not owner of NFT / NFT not approved to marketplace / NFT is already in marketplace / Prize should be greated than 0'
        );
    }

    function _getTokenToConsider(uint256 _marketPlaceId)
        internal
        view
        returns (ERC20)
    {
        ERC20 tokenToConsider = usdt;
        if (!marketplaceRecords[_marketPlaceId].isUSDT) {
            tokenToConsider = cubixToken;
        }
        return tokenToConsider;
    }

    function _beforeActionOnMarketplaceNFT(
        uint256 _marketPlaceId,
        uint256 tokenId,
        uint256 price
    ) internal view {
        MarketPlaceNFTType typeOfSale = marketplace[tokenId].typeOfSale;
        require(
            marketplace[tokenId].typeOfSale == typeOfSale &&
                marketplace[tokenId].id ==
                marketplaceRecords[marketplace[tokenId].id].id &&
                nft.ownerOf(tokenId) != msg.sender &&
                price > 0,
            'NFT is not on auction / Marketplace record not matched / Owner cant buy or put offer or place bid / Prize should be greated than 0'
        );

        if (MarketPlaceNFTType.ON_AUCTION == typeOfSale) {
            require(
                marketplace[tokenId].auctionEnds >= block.timestamp,
                'NFT auction is ended'
            );
            if (nftAuctionBidsRecords[_marketPlaceId].length > 0) {
                require(
                    price >
                        nftAuctionBidsRecords[_marketPlaceId][
                            nftAuctionBidsRecords[_marketPlaceId].length - 1
                        ].price,
                    'Bid should be higher than last bid'
                );
            } else {
                require(
                    price > marketplace[tokenId].price,
                    'Prize should be greated than base price'
                );
            }
        }
    }

    function putOnMarketplace(
        uint256 tokenId,
        uint256 price,
        MarketPlaceNFTType typeOfSale,
        uint256 auctionEndsInDays,
        bool isUSDT,
        uint256 perDayRent
    ) public payable returns (bool) {
        _beforePuttinOnMarketPlace(tokenId, price);
        uint256 auctionStarts = block.timestamp;
        uint256 auctionEnds = auctionStarts.add(auctionEndsInDays.mul(1 days));

        marketPlaceId = marketPlaceId.add(1);
        MarketPlaceNFT memory marketPlaceNFT = MarketPlaceNFT(
            marketPlaceId,
            tokenId,
            payable(msg.sender),
            price,
            typeOfSale,
            auctionStarts,
            auctionEnds,
            isUSDT,
            perDayRent
        );

        marketplace[tokenId] = marketPlaceNFT;
        marketplaceRecords[marketPlaceId] = marketPlaceNFT;

        if (royaltyOwners[tokenId] == address(0)) {
            royaltyOwners[tokenId] = msg.sender;
        }

        emit PutOnMarketPlace(
            marketPlaceId,
            tokenId,
            msg.sender,
            price,
            typeOfSale,
            auctionStarts,
            auctionEnds,
            isUSDT,
            perDayRent,
            block.timestamp
        );
        return true;
    }

    function putBidOnAuction(
        uint256 _marketPlaceId,
        uint256 tokenId,
        uint256 price
    ) public payable returns (bool) {
        uint256 priceToConsider = price;
        _beforeActionOnMarketplaceNFT(_marketPlaceId, tokenId, price);
        // check if same address placing bid again
        uint256 existingBid = nftAuctionBids[_marketPlaceId][msg.sender];
        if (existingBid != 0) {
            priceToConsider = price - existingBid;
        }

        ERC20 tokenToConsider = _getTokenToConsider(_marketPlaceId);
        require(
            checkBalance(priceToConsider, msg.sender, tokenToConsider),
            'Not having enough balance to bid'
        );

        // hold amount to contract
        tokenToConsider.transferFrom(
            msg.sender,
            address(this),
            priceToConsider
        );
        nftAuctionBids[_marketPlaceId][msg.sender] = price;

        if (existingBid != 0) {
            // delete existing bid
            for (
                uint256 i = 0;
                i < nftAuctionBidsRecords[_marketPlaceId].length;
                i++
            ) {
                if (
                    nftAuctionBidsRecords[_marketPlaceId][i].bidder ==
                    msg.sender
                ) {
                    delete nftAuctionBidsRecords[_marketPlaceId][i];
                }
            }
        }

        nftAuctionBidsRecords[_marketPlaceId].push(NFTBid(msg.sender, price));

        emit PutBidOnAuction(
            _marketPlaceId,
            tokenId,
            msg.sender,
            price,
            block.timestamp
        );

        return true;
    }

    function putOfferOnSale(
        uint256 _marketPlaceId,
        uint256 tokenId,
        uint256 price
    ) public payable returns (bool) {
        uint256 priceToConsider = price;
        _beforeActionOnMarketplaceNFT(_marketPlaceId, tokenId, price);
        ERC20 tokenToConsider = _getTokenToConsider(_marketPlaceId);
        // check if same address placing bid again
        uint256 existingOffer = nftOffers[_marketPlaceId][msg.sender];
        if (existingOffer != 0) {
            priceToConsider = price - existingOffer;
        }

        require(
            checkBalance(priceToConsider, msg.sender, tokenToConsider),
            'Not having enough balance to offer'
        );

        // hold amount to contract
        tokenToConsider.transferFrom(
            msg.sender,
            address(this),
            priceToConsider
        );
        nftOffers[_marketPlaceId][msg.sender] = price;

        if (existingOffer != 0) {
            // delete existing offer
            for (
                uint256 i = 0;
                i < nftOffersRecords[_marketPlaceId].length;
                i++
            ) {
                if (nftOffersRecords[_marketPlaceId][i].buyer == msg.sender) {
                    delete nftOffersRecords[_marketPlaceId][i];
                }
            }
        }

        nftOffersRecords[_marketPlaceId].push(NFTOffer(msg.sender, price));
        emit PutOfferOnSale(
            _marketPlaceId,
            tokenId,
            msg.sender,
            price,
            block.timestamp
        );
        return true;
    }

    function acceptOfferOnSale(
        uint256 tokenId,
        address buyer,
        uint256 _marketPlaceId
    ) public payable returns (bool) {
        // tranfer amount to owner, free other hold amounts and tranfer NFT
        require(
            nft.ownerOf(tokenId) == msg.sender &&
                marketplace[tokenId].typeOfSale == MarketPlaceNFTType.ON_SALE &&
                nftOffers[_marketPlaceId][buyer] != 0,
            'Owner only can accept offer / NFT is not on sale / Offer not found for given buyer'
        );
        ERC20 tokenToConsider = _getTokenToConsider(_marketPlaceId);

        // consider royalty
        uint256 royaltyAmount = nftOffers[_marketPlaceId][buyer]
            .mul(royaltyAmountPercentage)
            .div(1000);
        uint256 companyAmount = nftOffers[_marketPlaceId][buyer]
            .mul(companyAmountPercentage)
            .div(100);
        uint256 currentOwnerAmount = nftOffers[_marketPlaceId][buyer].sub(
            royaltyAmount.add(companyAmount)
        );

        tokenToConsider.transfer(msg.sender, currentOwnerAmount);
        tokenToConsider.transfer(royaltyOwners[tokenId], royaltyAmount);
        tokenToConsider.transfer(setlletmentAddress, companyAmount);

        for (uint256 i = 0; i < nftOffersRecords[_marketPlaceId].length; i++) {
            if (
                nftOffersRecords[_marketPlaceId][i].buyer != buyer &&
                nftOffersRecords[_marketPlaceId][i].price > 0
            ) {
                tokenToConsider.transfer(
                    nftOffersRecords[_marketPlaceId][i].buyer,
                    nftOffersRecords[_marketPlaceId][i].price
                );
            }
        }

        // transfer NFT here
        _removeFromSale(tokenId);
        transferNFT(nft.ownerOf(tokenId), buyer, tokenId, '');
        emit OfferAccepted(
            _marketPlaceId,
            tokenId,
            buyer,
            nftOffers[_marketPlaceId][buyer],
            block.timestamp
        );
        return true;
    }

    function _freeUpOffers(uint256 tokenId) internal {
        ERC20 tokenToConsider = _getTokenToConsider(marketplace[tokenId].id);
        for (
            uint256 i = 0;
            i < nftOffersRecords[marketplace[tokenId].id].length;
            i++
        ) {
            if (nftOffersRecords[marketplace[tokenId].id][i].price > 0) {
                tokenToConsider.transfer(
                    nftOffersRecords[marketplace[tokenId].id][i].buyer,
                    nftOffersRecords[marketplace[tokenId].id][i].price
                );
            }
        }
    }

    function _freeUpBids(uint256 tokenId) internal {
        ERC20 tokenToConsider = _getTokenToConsider(marketplace[tokenId].id);
        for (
            uint256 i = 0;
            i < nftAuctionBidsRecords[marketplace[tokenId].id].length;
            i++
        ) {
            if (nftAuctionBidsRecords[marketplace[tokenId].id][i].price > 0) {
                tokenToConsider.transfer(
                    nftAuctionBidsRecords[marketplace[tokenId].id][i].bidder,
                    nftAuctionBidsRecords[marketplace[tokenId].id][i].price
                );
            }
        }
    }

    function removeFromSale(uint256 tokenId) public {
        _freeUpOffers(tokenId);
        _freeUpBids(tokenId);
        _removeFromSale(tokenId);
    }

    function _removeFromSale(uint256 tokenId) internal {
        require(
            nft.ownerOf(tokenId) == msg.sender,
            'Owner only can remove from marketplace'
        );
        marketplace[tokenId].typeOfSale = MarketPlaceNFTType.REMOVED;

        emit PutOnMarketPlace(
            marketPlaceId,
            tokenId,
            msg.sender,
            marketplace[tokenId].price,
            marketplace[tokenId].typeOfSale,
            marketplace[tokenId].auctionStarts,
            marketplace[tokenId].auctionEnds,
            marketplace[tokenId].isUSDT,
            marketplace[tokenId].perDayRent,
            block.timestamp
        );
    }

    function setCubixTokenContractAddress(address cubixTokenAddress)
        external
        onlyOwner
    {
        cubixToken = ERC20(cubixTokenAddress);
    }

    function setSetlletmentAddress(address _setlletmentAddress)
        external
        onlyOwner
    {
        setlletmentAddress = payable(_setlletmentAddress);
    }

    function checkBalance(
        uint256 price,
        address sender,
        ERC20 tokenToConsider
    ) private view returns (bool) {
        uint256 balance = tokenToConsider.balanceOf(sender);
        uint256 allowance = tokenToConsider.allowance(
            msg.sender,
            address(this)
        );
        require(balance >= price, 'Error: insufficient Balance');
        require(allowance >= price, 'Error: allowance less than spending');
        return true;
    }

    function buyNFT(uint256 tokenId) public returns (bool) {
        _beforeActionOnMarketplaceNFT(
            marketplace[tokenId].id,
            tokenId,
            marketplace[tokenId].price
        );
        ERC20 tokenToConsider = _getTokenToConsider(marketplace[tokenId].id);
        require(
            checkBalance(
                marketplace[tokenId].price,
                msg.sender,
                tokenToConsider
            ),
            'Not having enough balance to buy'
        );

        // consider royalty
        uint256 royaltyAmount = marketplace[tokenId]
            .price
            .mul(royaltyAmountPercentage)
            .div(1000);
        uint256 companyAmount = marketplace[tokenId]
            .price
            .mul(companyAmountPercentage)
            .div(100);
        uint256 currentOwnerAmount = marketplace[tokenId].price.sub(
            royaltyAmount.add(companyAmount)
        );

        tokenToConsider.transferFrom(
            msg.sender,
            nft.ownerOf(tokenId),
            currentOwnerAmount
        );
        tokenToConsider.transferFrom(
            msg.sender,
            royaltyOwners[tokenId],
            royaltyAmount
        );
        tokenToConsider.transferFrom(
            msg.sender,
            setlletmentAddress,
            companyAmount
        );

        // free hold offer amount here
        _freeUpOffers(tokenId);
        _freeUpBids(tokenId);

        // transfer NFT here
        transferNFT(nft.ownerOf(tokenId), msg.sender, tokenId, '');

        _removeFromSale(tokenId);
        emit BuyNFT(
            tokenId,
            marketplace[tokenId].owner,
            msg.sender,
            marketplace[tokenId].price,
            block.timestamp
        );
        return true;
    }

    function setWinnerForAuction(uint256 tokenId, uint256 _marketPlaceId)
        public
        returns (bool)
    {
        require(
            marketplace[tokenId].typeOfSale == MarketPlaceNFTType.ON_AUCTION &&
                marketplace[tokenId].auctionEnds < block.timestamp &&
                marketplace[tokenId].id ==
                marketplaceRecords[marketplace[tokenId].id].id,
            'NFT is not on auction / NFT auction is not ended yet / Marketplace record not matched'
        );

        NFTBid memory winnerBid = nftAuctionBidsRecords[_marketPlaceId][
            nftAuctionBidsRecords[_marketPlaceId].length - 1
        ];

        // consider royalty
        uint256 currentOwnerAmount = winnerBid.price.sub(
            (winnerBid.price.mul(royaltyAmountPercentage).div(1000)).add(
                winnerBid.price.mul(companyAmountPercentage).div(100)
            )
        );
        _getTokenToConsider(_marketPlaceId).transfer(
            nft.ownerOf(tokenId),
            currentOwnerAmount
        );
        _getTokenToConsider(_marketPlaceId).transfer(
            royaltyOwners[tokenId],
            winnerBid.price.mul(royaltyAmountPercentage).div(1000)
        );
        _getTokenToConsider(_marketPlaceId).transfer(
            setlletmentAddress,
            winnerBid.price.mul(companyAmountPercentage).div(100)
        );

        for (
            uint256 i = 0;
            i < nftAuctionBidsRecords[_marketPlaceId].length;
            i++
        ) {
            if (
                nftAuctionBidsRecords[_marketPlaceId][i].bidder !=
                winnerBid.bidder
            ) {
                _getTokenToConsider(_marketPlaceId).transfer(
                    nftAuctionBidsRecords[_marketPlaceId][i].bidder,
                    nftAuctionBidsRecords[_marketPlaceId][i].price
                );
            }
        }

        // transfer NFT here
        marketplace[tokenId].typeOfSale = MarketPlaceNFTType.REMOVED;
        emit PutOnMarketPlace(
            marketPlaceId,
            tokenId,
            msg.sender,
            marketplace[tokenId].price,
            marketplace[tokenId].typeOfSale,
            marketplace[tokenId].auctionStarts,
            marketplace[tokenId].auctionEnds,
            marketplace[tokenId].isUSDT,
            marketplace[tokenId].perDayRent,
            block.timestamp
        );
        transferNFT(nft.ownerOf(tokenId), winnerBid.bidder, tokenId, '');

        emit AuctionWinnerDeclared(
            _marketPlaceId,
            tokenId,
            marketplace[tokenId].owner,
            winnerBid.bidder,
            winnerBid.price,
            block.timestamp
        );

        return true;
    }

    function getNFTOnRent(uint256 tokenId, uint256 _days)
        public
        returns (bool)
    {
        _beforeActionOnMarketplaceNFT(
            marketplace[tokenId].id,
            tokenId,
            marketplace[tokenId].price
        );
        require(_days > 0, 'Rent days should be greater than 0');
        require(rentedNFTs[tokenId] <= block.timestamp, "NFT is already rented");
        ERC20 tokenToConsider = _getTokenToConsider(marketplace[tokenId].id);
        uint256 price = marketplace[tokenId].perDayRent.mul(_days);
        uint256 starts = block.timestamp;
        uint256 ends = starts.add(_days.mul(1 days));
        require(
            checkBalance(price, msg.sender, tokenToConsider),
            'Not having enough balance to rent'
        );
        tokenToConsider.transferFrom(msg.sender, nft.ownerOf(tokenId), price);
        nftRentRecords[marketplace[tokenId].id][msg.sender] = NFTRent(
            msg.sender,
            price,
            starts,
            ends
        );
        rentedNFTs[tokenId] = ends;
        emit RentedNFT(
            tokenId,
            marketplace[tokenId].owner,
            msg.sender,
            price,
            starts,
            ends,
            block.timestamp
        );
        return true;
    }

    function transferNFT(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) private {
        nft.safeTransferFrom(from, to, tokenId, data);
    }

    function getNFTBackFromRent(uint256 tokenId) external {
        require(
            nft.ownerOf(tokenId) == msg.sender &&
                marketplace[tokenId].typeOfSale == MarketPlaceNFTType.ON_RENT &&
                nftRentRecords[marketplace[tokenId].id][msg.sender].ends >
                block.timestamp,
            'You are not owner of NFT / NFT is not on rent / NFT is  rent period is not ended'
        );
        marketplace[tokenId].typeOfSale = MarketPlaceNFTType.REMOVED;
        rentedNFTs[tokenId] = 0;
        emit RentedNFTFinished(marketplace[tokenId].id, block.timestamp);
    }
}
