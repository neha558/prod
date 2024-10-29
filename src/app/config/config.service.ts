import { TypeOrmModuleOptions } from '@nestjs/typeorm';

require('dotenv').config();

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getPort() {
    return this.getValue('PORT', true);
  }

  public isProduction() {
    const mode = this.getValue('MODE', false);
    return mode != 'DEV';
  }

  public getDomain() {
    const domain = this.getValue('DOMAIN_NAME', false);
    return domain;
  }

  public getMasterEntryDone() {
    const masterEntryDone = this.getValue('MASTER_ENTRY_DONE', false);
    return masterEntryDone === '1';
  }

  public getRunCrons() {
    const runCron = this.getValue('RUN_CRONS', false);
    return runCron === '1';
  }

  public getLatestBlockToConsider() {
    const latestBlockToConsider = this.getValue(
      'LATEST_BLOCK_TO_CONSIDER',
      false,
    );
    return latestBlockToConsider !== '0' ? parseInt(latestBlockToConsider) : 0;
  }

  public getManagerPrivateKey() {
    const mode = this.getValue('MODE', false);
    return mode != 'DEV'
      ? this.getValue('OWNER_PRIVATE_KEY_PROD', true)
      : this.getValue('OWNER_PRIVATE_KEY_DEV', true);
  }

  public getJWTSecret() {
    return this.getValue('JWT_SECRET', true);
  }

  public getHttpProvider() {
    return this.getValue('HTTP_PROVIDER', true);
  }

  public getContractAddress() {
    return this.getValue('CONTRACT_ADDRESS', true);
  }

  public getStackingContractAddress() {
    return this.getValue('STACKING_CONTRACT_ADDRESS', true);
  }

  public getStackingRewardContractAddress() {
    return this.getValue('STACKING_REWARD_CONTRACT_ADDRESS', true);
  }

  public getStackingRewardContractAddressV2() {
    return this.getValue('STACKING_REWARD_CONTRACT_ADDRESS_V2', true);
  }

  public getMoralisAPIUrl() {
    return this.getValue('MORALIS_API_URL', true);
  }

  public getChain() {
    return this.getValue('CHAIN', true);
  }

  public getMoralisAPIKey() {
    return this.getValue('MORALIS_API_KEY', true);
  }

  public getAlchemyAPIKey() {
    return this.getValue('ALCHEMY_API_KEY', true);
  }

  public getNFTContractAddress() {
    return this.getValue('NFT_CONTRACT_ADDRESS', true);
  }

  public getForceCallCode() {
    return this.getValue('FORCE_CALL_CODE', false);
  }

  public getRewardStartDate() {
    return this.getValue('REWARD_START_DATE', false);
  }

  public getStakingManagerPrivateKey() {
    return this.getValue('STACKING_REWARD_MANAGER_PRIVATE_KEY', false);
  }

  public getStakingManager() {
    return this.getValue('STACKING_REWARD_MANAGER_ADDRESS', false);
  }

  public getStartReward() {
    return this.getValue('START_REWARD', false);
  }

  public getRentalAPICallKey() {
    return this.getValue('RENTAL_API_CALL_KEY', true);
  }

  public getTypeOrmConfig(type = 'migration'): TypeOrmModuleOptions {
    return {
      type: 'postgres',

      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT')),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DATABASE'),

      migrationsTableName: 'migration',

      ssl: false,

      entities: ['dist/**/*.entity{.ts,.js}'],
      migrations: ['dist/src/migration/*.ts'],
      cli: {
        migrationsDir: 'dist/src/migration',
      },
    };
  }
}

const configService = new ConfigService(process.env).ensureValues([
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
  'JWT_SECRET',
  'CONTRACT_BLOCK_NUMBER',
  'HTTP_PROVIDER',
  'DOMAIN_NAME',
  'CONTRACT_ADDRESS',
]);

export { configService };
