import { MigrationInterface, QueryRunner } from 'typeorm';

export class addedLastBidPriceInMarketplace1663866154080
  implements MigrationInterface
{
  name = 'addedLastBidPriceInMarketplace1663866154080';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_rent_records" RENAME COLUMN "owner" TO "rental"`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace" ADD "last_bid" bigint NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "marketplace" DROP COLUMN "last_bid"`);
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_rent_records" RENAME COLUMN "rental" TO "owner"`,
    );
  }
}
