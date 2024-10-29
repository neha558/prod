import { MigrationInterface, QueryRunner } from 'typeorm';

export class addedNftViews1660658630870 implements MigrationInterface {
  name = 'addedNftViews1660658630870';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" ADD "views" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" DROP COLUMN "views"`,
    );
  }
}
