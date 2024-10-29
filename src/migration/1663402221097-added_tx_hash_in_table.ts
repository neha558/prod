import { MigrationInterface, QueryRunner } from 'typeorm';

export class addedTxHashInTable1663402221097 implements MigrationInterface {
  name = 'addedTxHashInTable1663402221097';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "marketplace" ADD "tx_hash" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace" ADD CONSTRAINT "UQ_afe4e6666aef96913dbfdf24553" UNIQUE ("tx_hash")`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_offers_records" ADD "tx_hash" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_offers_records" ADD CONSTRAINT "UQ_5b03186cb14e7d5ea1511f5ac09" UNIQUE ("tx_hash")`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_rent_records" ADD "tx_hash" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_rent_records" ADD CONSTRAINT "UQ_f0e9eb6d54b87ed19ce5710408b" UNIQUE ("tx_hash")`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_auction_records" ADD "tx_hash" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_auction_records" ADD CONSTRAINT "UQ_01bb35141ceaca120b04ec9c20c" UNIQUE ("tx_hash")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_auction_records" DROP CONSTRAINT "UQ_01bb35141ceaca120b04ec9c20c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_auction_records" DROP COLUMN "tx_hash"`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_rent_records" DROP CONSTRAINT "UQ_f0e9eb6d54b87ed19ce5710408b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_rent_records" DROP COLUMN "tx_hash"`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_offers_records" DROP CONSTRAINT "UQ_5b03186cb14e7d5ea1511f5ac09"`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_offers_records" DROP COLUMN "tx_hash"`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace" DROP CONSTRAINT "UQ_afe4e6666aef96913dbfdf24553"`,
    );
    await queryRunner.query(`ALTER TABLE "marketplace" DROP COLUMN "tx_hash"`);
  }
}
