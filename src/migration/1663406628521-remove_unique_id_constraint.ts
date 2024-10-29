import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeUniqueIdConstraint1663406628521
  implements MigrationInterface
{
  name = 'removeUniqueIdConstraint1663406628521';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_auction_records" DROP CONSTRAINT "UQ_472b67541ffcec964e80d0bbb33"`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_offers_records" DROP CONSTRAINT "UQ_bfc4bce7891e0662f81647ff025"`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_rent_records" DROP CONSTRAINT "UQ_3387d2c59d30df2aa669287faa0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace" DROP CONSTRAINT "UQ_abec7d5183c0e40f48920466229"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "marketplace" ADD CONSTRAINT "UQ_abec7d5183c0e40f48920466229" UNIQUE ("_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_rent_records" ADD CONSTRAINT "UQ_3387d2c59d30df2aa669287faa0" UNIQUE ("_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_offers_records" ADD CONSTRAINT "UQ_bfc4bce7891e0662f81647ff025" UNIQUE ("_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_auction_records" ADD CONSTRAINT "UQ_472b67541ffcec964e80d0bbb33" UNIQUE ("_id")`,
    );
  }
}
