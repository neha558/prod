import { MigrationInterface, QueryRunner } from 'typeorm';

export class addedMetadataFields1664787782393 implements MigrationInterface {
  name = 'addedMetadataFields1664787782393';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "marketplace" DROP COLUMN "last_bid"`);
    await queryRunner.query(
      `ALTER TABLE "marketplace" ADD "last_bid" bigint NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "nft_owners_relation" ADD "no" text`);
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" ADD "name" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" ADD "short_name" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" ADD "country" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" ADD "points" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" ADD "roles" text`,
    );
    await queryRunner.query(`ALTER TABLE "nft_owners_relation" ADD "age" text`);
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" ADD "batting_style" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" ADD "bowling_style" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" DROP COLUMN "bowling_style"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" DROP COLUMN "batting_style"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" DROP COLUMN "age"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" DROP COLUMN "roles"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" DROP COLUMN "points"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" DROP COLUMN "country"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" DROP COLUMN "short_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" DROP COLUMN "name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" DROP COLUMN "no"`,
    );
    await queryRunner.query(`ALTER TABLE "marketplace" DROP COLUMN "last_bid"`);
    await queryRunner.query(
      `ALTER TABLE "marketplace" ADD "last_bid" bigint NOT NULL DEFAULT '0'`,
    );
  }
}
