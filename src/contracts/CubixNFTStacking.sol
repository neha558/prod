// SPDX-License-Identifier: GPL-3.0
/**
 *
 * Cubix NFT stacking
 * URL: cubixpro.world/
 *
 */
pragma solidity >=0.6.0;

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

interface ERC720 {
    function transfer(address recipient, uint256 amount)
        external
        returns (bool);
}

interface ERC721 {
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

contract CubixNFTStacking {
    using SafeMath for uint256;

    address ownerAddress;
    address managerAddress;
    ERC721 nft;
    ERC720 token;

    // 0 => Common
    // 1 => Rare
    // 2 => Super Rare
    // 4 => Legendary

    mapping(uint256 => uint256[]) public ratesPerDay;

    uint256 counter = 0;
    struct Stake {
        uint256 counter;
        address owner;
        uint256 tokenId;
        uint256 nftCategory;
        uint256 rate;
        uint256 timestamp;
        uint256 ends;
        bool isCategoryVerified;
        uint256 tenureDays;
    }
    mapping(address => mapping(uint256 => Stake)) public stakes;
    mapping(address => uint256[]) public stakedNFTs;
    mapping(address => uint256) public claimableAmount;
    mapping(uint256 => uint256) public validatedNFTCategory;

    event NFTStaked(
        uint256 counter,
        address owner,
        uint256 tokenId,
        uint256 nftCategory,
        uint256 rates,
        uint256 stackedOn,
        uint256 ends,
        bool isCategoryVerified
    );
    event NFTUnstaked(
        uint256 counter,
        address owner,
        uint256 tokenId,
        uint256 stakingTime,
        uint256 stakingReward,
        uint256 totalReward
    );
    event Claimed(address owner, uint256 amount);
    event NFTCategoryValidated(uint256 tokenId);

    constructor(address _nft, address _token, address _managerAddress) {
        nft = ERC721(_nft);
        token = ERC720(_token);
        ownerAddress = msg.sender;
        managerAddress = _managerAddress;

        // token rewards
        ratesPerDay[1] = [1, 20, 30, 40];
        ratesPerDay[2] = [2, 20, 30, 40];
        ratesPerDay[3] = [3, 20, 30, 40];
        ratesPerDay[4] = [4, 20, 30, 40];
        ratesPerDay[5] = [5, 20, 30, 40];
        ratesPerDay[6] = [6, 20, 30, 40];
        ratesPerDay[7] = [7, 20, 30, 40];
        ratesPerDay[8] = [8, 20, 30, 40];
        ratesPerDay[9] = [9, 20, 30, 40];
        ratesPerDay[10] = [10, 20, 30, 40];
        ratesPerDay[11] = [11, 20, 30, 40];
        ratesPerDay[12] = [12, 20, 30, 40];
    }

    
    modifier onlyManagement() {
        require(msg.sender == managerAddress, 'Only manager');
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == ownerAddress, 'Only owner');
        _;
    }

    function stake(
        uint256[] calldata _tokenId,
        uint256[] calldata _nftCategory,
        uint256[] calldata tenure
    ) external {
        require(_tokenId.length > 0, 'Provide Token Id');
        require(_nftCategory.length > 0, 'Provide Category Id');
        require(tenure.length > 0, 'Provide tenure');

        for (uint256 index = 0; index < _tokenId.length; index++) {
            require(
                nft.ownerOf(_tokenId[index]) == msg.sender,
                'You dont own the NFT'
            );
            require(
                ratesPerDay[tenure[index]][_nftCategory[index]] != 0,
                'Invalid category'
            );

            require(
               stakes[msg.sender][_tokenId[index]].counter == 0,
                'NFT already stacked'
            );

            counter = counter.add((1));

            uint256 starts = block.timestamp;
            // uint256 ends = starts.add(tenure[index].mul(30 days));
            // @todo remove once testing done
            uint256 ends = starts.add(tenure[index].mul(1 days));
            bool isCategoryVerified = validatedNFTCategory[_tokenId[index]] ==
                _nftCategory[index];

            stakes[msg.sender][_tokenId[index]] = Stake(
                counter,
                msg.sender,
                _tokenId[index],
                _nftCategory[index],
                ratesPerDay[tenure[index]][_nftCategory[index]],
                starts,
                ends,
                isCategoryVerified,
                tenure[index].mul(1 days)
            );

            nft.transferFrom(msg.sender, address(this), _tokenId[index]);
            stakedNFTs[msg.sender].push(_tokenId[index]);
            emit NFTStaked(
                counter,
                msg.sender,
                _tokenId[index],
                _nftCategory[index],
                ratesPerDay[tenure[index]][_nftCategory[index]],
                starts,
                ends,
                isCategoryVerified
            );
        }
    }

    function unstake(uint256[] calldata _tokenId) external {
        require(_tokenId.length > 0, 'Provide Token Id');
        for (uint256 index = 0; index < _tokenId.length; index++) {
            require(
                stakes[msg.sender][_tokenId[index]].owner == msg.sender,
                'You dont own the NFT'
            );
            require(
                stakes[msg.sender][_tokenId[index]].ends >= block.timestamp,
                'You cant unstack NFT, as tenure not completed yet'
            );

            nft.transferFrom(address(this), msg.sender, _tokenId[index]);
            uint256 tenureDays = stakes[msg.sender][_tokenId[index]].tenureDays;
            uint256 claimableBalance = stakes[msg.sender][_tokenId[index]]
                .rate
                .mul(tenureDays);

            if (stakes[msg.sender][_tokenId[index]].isCategoryVerified) {
                claimableAmount[msg.sender] += claimableBalance;
            }

            emit NFTUnstaked(
                stakes[msg.sender][_tokenId[index]].counter,
                msg.sender,
                _tokenId[index],
                tenureDays,
                claimableBalance,
                claimableAmount[msg.sender]
            );
            delete stakes[msg.sender][_tokenId[index]];

            for (
                uint256 i = 0;
                index < stakedNFTs[msg.sender].length;
                index++
            ) {
                if (stakedNFTs[msg.sender][i] == _tokenId[index]) {
                    delete stakedNFTs[msg.sender][i];
                    break;
                }
            }
        }
    }

    function claim() external {
        uint256 amount = claimableAmount[msg.sender];
        require(amount > 0, 'No rewards for claim');
        token.transfer(msg.sender, amount);
        claimableAmount[msg.sender] = 0;
        emit Claimed(msg.sender, amount);
    }

    function getAvailableRewards(address _address)
        public
        view
        returns (uint256)
    {
        uint256 availableBalance = 0;
        for (uint256 index = 0; index < stakedNFTs[_address].length; index++) {
            uint256 _tokenId = stakedNFTs[_address][index];
            uint256 tenureDays = stakes[_address][_tokenId].tenureDays;
            availableBalance = availableBalance.add(stakes[_address][_tokenId].rate.mul(tenureDays));
        }
        return availableBalance;
    }

    function totalStackedNFTs(address _address) public view returns (uint256) {
        return stakedNFTs[_address].length;
    }

    function validateCategoryOfStackedNFT(
        uint256[] calldata _tokenIds,
        uint256[] calldata _categoryIds
    ) external onlyManagement {
        require(_tokenIds.length > 0, 'Token IDs cant be empty');
        require(_categoryIds.length > 0, 'Category IDs cant be empty');
        for (uint256 index = 0; index < _tokenIds.length; index++) {
            validatedNFTCategory[_tokenIds[index]] = _categoryIds[index];
            emit NFTCategoryValidated(_tokenIds[index]);
        }
    }

    // @todo remove once validate
    function revertStack(uint256[] calldata _tokenId) external {
        for (uint256 index = 0; index < _tokenId.length; index++) {
            require(
                stakes[msg.sender][_tokenId[index]].owner == msg.sender,
                'You dont own the NFT'
            );
            nft.transferFrom(address(this), msg.sender, _tokenId[index]);
            delete stakes[msg.sender][_tokenId[index]];
            for (
                uint256 i = 0;
                index < stakedNFTs[msg.sender].length;
                index++
            ) {
                if (stakedNFTs[msg.sender][i] == _tokenId[index]) {
                    delete stakedNFTs[msg.sender][i];
                    break;
                }
            }
        }
    }
}
