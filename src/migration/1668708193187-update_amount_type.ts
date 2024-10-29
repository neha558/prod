import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateAmountType1668708193187 implements MigrationInterface {
  name = 'updateAmountType1668708193187';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_rewards_claims" DROP COLUMN "amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_rewards_claims" ADD "amount" text NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_rewards_claims" DROP COLUMN "amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_rewards_claims" ADD "amount" text NOT NULL DEFAULT '0'`,
    );
  }
}
