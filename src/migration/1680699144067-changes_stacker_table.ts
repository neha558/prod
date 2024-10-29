import { MigrationInterface, QueryRunner } from 'typeorm';

export class changesStackerTable1680699144067 implements MigrationInterface {
  name = 'changesStackerTable1680699144067';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "stackers" ADD "last_sync_on" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stackers" DROP COLUMN "last_sync_on"`,
    );
  }
}
