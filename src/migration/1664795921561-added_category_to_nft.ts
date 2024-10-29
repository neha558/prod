import { MigrationInterface, QueryRunner } from 'typeorm';

export class addedCategoryToNft1664795921561 implements MigrationInterface {
  name = 'addedCategoryToNft1664795921561';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" ADD "category" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" DROP COLUMN "category"`,
    );
  }
}
