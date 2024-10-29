import { MigrationInterface, QueryRunner } from 'typeorm';

export class changesInRewardHolidingTable1668397877453
  implements MigrationInterface
{
  name = 'changesInRewardHolidingTable1668397877453';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" ADD "request_id" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" ADD "tx_id" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" ADD "total_supply" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" ADD "type_of_card" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" DROP COLUMN "type_of_card"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" DROP COLUMN "total_supply"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" DROP COLUMN "tx_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" DROP COLUMN "request_id"`,
    );
  }
}
