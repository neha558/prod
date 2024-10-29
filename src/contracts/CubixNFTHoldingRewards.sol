// SPDX-License-Identifier: GPL-3.0
/**
 *
 * Cubix NFT holding rewards
 * URL: cubixpro.world/
 *
 */
pragma solidity >=0.6.0;

library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath: subtraction overflow");
        uint256 c = a - b;
        return c;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0, "SafeMath: division by zero");
        uint256 c = a / b;
        return c;
    }
}

interface ERC720 {
    function transfer(address recipient, uint256 amount)
        external
        returns (bool);
    function decimals() external view returns (uint8);
}

interface ERC721 {
    function totalSupply() external view returns (uint256 totalSupply);
    function getApproved(uint256 tokenId)
        external
        view
        returns (address operator);

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function ownerOf(uint256 tokenId) external view returns (address owner);
}

contract CubixNFTHoldingRewards {
    using SafeMath for uint256;
    enum TypeOfCard {
        INTL,
        DOM
    }
    struct Stake {
        address owner;
        uint256 endTime;
        uint256 enrollTime;
    }

    struct RewardMatrix {
        uint256 totalSupplyLimit;
        uint256 tokens;
        TypeOfCard typeOfPlayer;
    }

    address ownerAddress;
    ERC721 nft;
    ERC720 token;

    uint256 public lastEnrollNft = 0;

    RewardMatrix[] public rewardMatrix;

    mapping(uint256 => Stake) public stakes;
    mapping(uint256 => TypeOfCard) public typeOfCards;

    mapping(address => uint256) public totalClaimableRewards;
    mapping(address => uint256) public totalClaimedRewards;

    uint256 counter = 0;
    uint256 public percentageDelta = 10;
    uint256 public tokenLimitDelta = 2;
    uint256 public deltaTime = 1 hours;
    uint256 public deltaUnit = 1;
    uint256 public tokenDecimals;

    event Rewared(uint256 tokenId, address owner, uint256 amount, uint256 time);
    event NFTStaked(
        uint256 tokenId,
        address owner,
        uint256 ends,
        uint256 enrolled,
        uint256 time,
        TypeOfCard typeOfPlayer
    );

    event Claimed(address owner, uint256 amount, uint256 time);
    event UpdatedPlayerType(uint256 tokenId, TypeOfCard typeOfCard);
    event DeltaSettingsChanged(uint256 percentageDelta, uint256 tokenLimitDelta, uint256 deltaTime, uint256 deltaUnit);

    constructor(
        address _nft,
        address _token
    ) {
        nft = ERC721(_nft);
        token = ERC720(_token);
        ownerAddress = msg.sender;
        tokenDecimals = token.decimals();

        // matrix for from first day collection if total supply is less then 50000
        rewardMatrix.push(
            RewardMatrix(
                (0 * tokenLimitDelta).add(1),
                2 * (10 ** tokenDecimals),
                TypeOfCard.INTL
            )
        );
        setNextRewardMatrix(1, TypeOfCard.INTL);
        setNextRewardMatrix(2, TypeOfCard.INTL);
        setNextRewardMatrix(3, TypeOfCard.INTL);

        initCurrentNFTStakes();
    }

    function setNextRewardMatrix(uint256 index, TypeOfCard _type) internal {
        if (index > rewardMatrix.length.sub(1)) {
            rewardMatrix.push(
                RewardMatrix(
                    (index * tokenLimitDelta).add(1),
                    rewardMatrix[index.sub(1)].tokens.sub(
                        rewardMatrix[index.sub(1)].tokens.div(10)
                    ),
                    _type
                )
            );
            return;
        }

        rewardMatrix[index] = RewardMatrix(
            (index * tokenLimitDelta).add(1),
            rewardMatrix[index.sub(1)].tokens.sub(
                rewardMatrix[index.sub(1)].tokens.div(10)
            ),
            _type
        );
    }

    modifier onlyOwner() {
        require(msg.sender == ownerAddress, "Only owner");
        _;
    }

    function enrollForRewards() public onlyOwner {
        initCurrentNFTStakes();
    }

    function initCurrentNFTStakes() internal {
        uint256 nftCounter = nft.totalSupply();
        uint256 lastEnrollNftToConsider = nftCounter;

        uint256 nowIs = block.timestamp;
        uint256 ends = nowIs.add(deltaUnit.mul(deltaTime));

        for (uint256 index = nftCounter; index > nftCounter; index--) {
            address ownerOfNFT = nft.ownerOf(nftCounter);
            stakes[nftCounter] = Stake(ownerOfNFT, ends, nowIs);
            typeOfCards[nftCounter] = TypeOfCard.INTL;
            emit NFTStaked(
                nftCounter,
                ownerOfNFT,
                ends,
                nowIs,
                block.timestamp,
                typeOfCards[nftCounter]
            );
            nftCounter = nftCounter.sub(1);            
        }
        lastEnrollNft = lastEnrollNftToConsider;
    }

    function handleTransferNFT(
        address[] calldata _newOwner,
        uint256[] calldata _tokenId
    ) external onlyOwner {
        require(_tokenId.length > 0, "Provide Token Id");
        uint256 nowIs = block.timestamp;
        uint256 ends = nowIs.add(deltaUnit.mul(deltaTime));
        for (uint256 index = 0; index < _tokenId.length; index++) {
            address ownerOfNFT = nft.ownerOf(_tokenId[index]);
            if (_newOwner[index] == ownerOfNFT) {               
                stakes[_tokenId[index]] = Stake(_newOwner[index], ends, nowIs);
                emit NFTStaked(
                    _tokenId[index],
                    _newOwner[index],
                    ends,
                    nowIs,
                    block.timestamp,
                    typeOfCards[_tokenId[index]]
                );
            }
        }
    }

    function handleTranferReward() external onlyOwner {
        uint256 totalNFTs = nft.totalSupply();
        uint256 nftCounter = 1;
        uint256 nowIs = block.timestamp;
        uint256 ends = nowIs.add(deltaUnit.mul(deltaTime));
        // check and add reward matrix
        if (
            totalNFTs >=
            rewardMatrix[rewardMatrix.length.sub(1)].totalSupplyLimit.add(tokenLimitDelta)
        ) {
            setNextRewardMatrix(rewardMatrix.length, TypeOfCard.INTL);
        }

        while (nftCounter <= lastEnrollNft) {
            if (
                stakes[nftCounter].endTime != 0 &&
                stakes[nftCounter].endTime <= block.timestamp
            ) {
                uint256 newEnds = stakes[nftCounter].endTime.add(
                    deltaUnit.mul(deltaTime)
                );
                address ownerOfNFT = nft.ownerOf(nftCounter);

                if (stakes[nftCounter].owner == ownerOfNFT) {
                    stakes[nftCounter].endTime = newEnds;
                } else {                  
                    stakes[nftCounter] = Stake(ownerOfNFT, ends, nowIs);
                    emit NFTStaked(
                        nftCounter,
                        ownerOfNFT,
                        ends,
                        nowIs,
                        block.timestamp,
                        typeOfCards[nftCounter]
                    );
                }
                uint256 _reward = getNFTTotalSupplyBasedReward(
                    totalNFTs,
                    nftCounter
                );

                totalClaimableRewards[
                    stakes[nftCounter].owner
                ] = totalClaimableRewards[stakes[nftCounter].owner].add(
                    _reward
                );

                emit Rewared(
                    nftCounter,
                    stakes[nftCounter].owner,
                    _reward,
                    block.timestamp
                );
                emit NFTStaked(
                    nftCounter,
                    ownerOfNFT,
                    newEnds,
                    0,
                    block.timestamp,
                    typeOfCards[nftCounter]
                );
            }
            nftCounter = nftCounter.add(1);
        }
        // init for new minted
        initCurrentNFTStakes();
    }

    function getNFTTotalSupplyBasedReward(uint256 totalNFTs, uint256 tokenId)
        internal
        view
        returns (uint256)
    {
        uint256 rewards = 0;
        for (uint256 index = 0; index < rewardMatrix.length; index++) {
            if (
                totalNFTs >= rewardMatrix[index].totalSupplyLimit &&
                typeOfCards[tokenId] == rewardMatrix[index].typeOfPlayer
            ) {
                rewards = rewardMatrix[index].tokens;
                break;
            }
        }
        return rewards;
    }

    function claim() public {
        uint256 amount = totalClaimableRewards[msg.sender];
        require(amount > 0, "No reward found yet");
        token.transfer(msg.sender, amount);
        totalClaimableRewards[msg.sender] = 0;
        totalClaimedRewards[msg.sender] = totalClaimedRewards[msg.sender].add(
            amount
        );
        emit Claimed(msg.sender, amount, block.timestamp);
    }

    function setRewardMatrix(
        uint256 index,
        uint256 tokenLimit,
        uint256 reward,
        TypeOfCard _type
    ) external onlyOwner {
        if (index > rewardMatrix.length.sub(1)) {
            rewardMatrix.push(RewardMatrix(tokenLimit, reward, _type));
        } else {
            rewardMatrix[index] = RewardMatrix(tokenLimit, reward, _type);
        }
    }

    function setPlayerType(uint256[] calldata tokenIds, TypeOfCard _type)
        external
        onlyOwner
    {
        require(tokenIds.length > 0, "Please provide token ids");
        for (uint256 index = 0; index < tokenIds.length; index++) {
            typeOfCards[tokenIds[index]] = _type;
            emit UpdatedPlayerType(tokenIds[index], _type);
        }
    }

    function changeOwnerShip(address _owner) external onlyOwner {
        ownerAddress = _owner;
    }

    function matrixLenght() public view returns(uint256) {
        return rewardMatrix.length;
    }

    function contractCurrentTime() public view returns(uint256) {
        return block.timestamp;
    }

    function changeRewardDeltas(uint256 _percentageDelta, uint256 _tokenLimitDelta, uint256 _deltaTime, uint256 _deltaUnit) external onlyOwner {
        percentageDelta = _percentageDelta;
        tokenLimitDelta = _tokenLimitDelta;
        deltaTime = _deltaTime.mul(1 hours);
        deltaUnit = _deltaUnit;

        emit DeltaSettingsChanged(percentageDelta, tokenLimitDelta, deltaTime, deltaUnit);
    }
}
