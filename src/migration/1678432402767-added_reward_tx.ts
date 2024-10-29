import { MigrationInterface, QueryRunner } from 'typeorm';

export class addedRewardTx1678432402767 implements MigrationInterface {
  name = 'addedRewardTx1678432402767';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_rental_user_pool" ADD "reward_tx" text NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_rental_user_pool" DROP COLUMN "reward_tx"`,
    );
  }
}
