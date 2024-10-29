import {
  CONTRACT_ABI,
  CONTRACT_ABI_NFT,
  CONTRACT_ABI_STACKING,
  CONTRACT_ADDRESS,
  CONTRACT_ADDRESS_NFT,
  CONTRACT_ADDRESS_STACKING,
  STACKING_REWARDS_ABI,
  STACKING_REWARD_CONTRACT_ADDRESS,
} from './app.constants';
import { configService } from './config.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Provider = require('@truffle/hdwallet-provider');

export const RPC_URL = configService.getHttpProvider();
export const web3 = new Web3(RPC_URL);
export const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

export const notSetAddress = '0x0000000000000000000000000000000000000000';

export const contractStacking = new web3.eth.Contract(
  CONTRACT_ABI_STACKING,
  CONTRACT_ADDRESS_STACKING,
);

export const contractNFT = new web3.eth.Contract(
  CONTRACT_ABI_NFT,
  '0x6da8a67989cbecbc971d574522081df25416b057' || CONTRACT_ADDRESS_NFT,
);

export const categoryMapForStaking = {
  4: 0,
  3: 1,
  2: 2,
  1: 3,
};

export const cubixTokenDecimals = 100000000;

export const managerProvider = new Provider(
  configService.getStakingManagerPrivateKey(),
  RPC_URL,
);
export const web3StakingRewardContract = new Web3(managerProvider);

export const contractStakingReward = new web3StakingRewardContract.eth.Contract(
  STACKING_REWARDS_ABI,
  STACKING_REWARD_CONTRACT_ADDRESS,
);
