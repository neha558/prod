import { MigrationInterface, QueryRunner } from 'typeorm';

export class changesInStackersTokenIds1680670961310
  implements MigrationInterface
{
  name = 'changesInStackersTokenIds1680670961310';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stackers_token_ids" DROP COLUMN "token_staking_time"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stackers_token_ids" ADD "token_staking_time" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stackers_token_ids" DROP COLUMN "token_staking_time"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stackers_token_ids" ADD "token_staking_time" integer`,
    );
  }
}
