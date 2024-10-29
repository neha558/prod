import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeUniqueContraintFromHistoru1663438746941
  implements MigrationInterface
{
  name = 'removeUniqueContraintFromHistoru1663438746941';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "marketplace_transactions_history" DROP CONSTRAINT "UQ_501e0faab1678cd56298e48cf81"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "marketplace_transactions_history" ADD CONSTRAINT "UQ_501e0faab1678cd56298e48cf81" UNIQUE ("tx_hash")`,
    );
  }
}
