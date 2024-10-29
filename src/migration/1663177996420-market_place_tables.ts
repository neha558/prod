import { MigrationInterface, QueryRunner } from 'typeorm';

export class marketPlaceTables1663177996420 implements MigrationInterface {
  name = 'marketPlaceTables1663177996420';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "marketplace" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "_id" integer NOT NULL, "token_id" integer NOT NULL, "owner" text NOT NULL, "price" bigint NOT NULL, "type_of_sale" integer NOT NULL, "auction_starts" bigint NOT NULL, "auction_ends" bigint NOT NULL, "is_usdt" boolean NOT NULL, "per_day_rent" bigint NOT NULL, "nftDetailsId" uuid, "ownerUserId" uuid, CONSTRAINT "UQ_abec7d5183c0e40f48920466229" UNIQUE ("_id"), CONSTRAINT "PK_d9c9a956a1a45b27b56db53bfc8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "marketplace_nft_offers_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "_id" integer NOT NULL, "owner" text NOT NULL, "price" bigint NOT NULL, "is_accepted" boolean NOT NULL DEFAULT false, "status" character varying NOT NULL DEFAULT 'pending', "buyerUserId" uuid, CONSTRAINT "UQ_bfc4bce7891e0662f81647ff025" UNIQUE ("_id"), CONSTRAINT "PK_da179347ab24f7006b1c40b7b45" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "marketplace_nft_rent_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "_id" integer NOT NULL, "owner" text NOT NULL, "price" bigint NOT NULL, "starts" bigint NOT NULL, "ends" bigint NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "rentalUserId" uuid, CONSTRAINT "UQ_3387d2c59d30df2aa669287faa0" UNIQUE ("_id"), CONSTRAINT "PK_1e683f40696a2ec5e95b7bd70c1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "marketplace_nft_auction_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "_id" integer NOT NULL, "owner" text NOT NULL, "price" bigint NOT NULL, "is_winner" boolean NOT NULL DEFAULT false, "status" character varying NOT NULL DEFAULT 'pending', "bidderUserId" uuid, CONSTRAINT "UQ_472b67541ffcec964e80d0bbb33" UNIQUE ("_id"), CONSTRAINT "PK_52a4ae83e8d7b3b7dc6d200aa39" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace" ADD CONSTRAINT "FK_49c96ab734daeb8a35e90ae2633" FOREIGN KEY ("nftDetailsId") REFERENCES "nft_owners_relation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace" ADD CONSTRAINT "FK_ca8db6560b49472312a872f81c1" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_offers_records" ADD CONSTRAINT "FK_20c25c08714a29fda9667ec136b" FOREIGN KEY ("buyerUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_rent_records" ADD CONSTRAINT "FK_38e3efadfb74576101a6844d1ce" FOREIGN KEY ("rentalUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_auction_records" ADD CONSTRAINT "FK_916e6c2e3ae0601c82996cbf890" FOREIGN KEY ("bidderUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_auction_records" DROP CONSTRAINT "FK_916e6c2e3ae0601c82996cbf890"`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_rent_records" DROP CONSTRAINT "FK_38e3efadfb74576101a6844d1ce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_nft_offers_records" DROP CONSTRAINT "FK_20c25c08714a29fda9667ec136b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace" DROP CONSTRAINT "FK_ca8db6560b49472312a872f81c1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace" DROP CONSTRAINT "FK_49c96ab734daeb8a35e90ae2633"`,
    );
    await queryRunner.query(`DROP TABLE "marketplace_nft_auction_records"`);
    await queryRunner.query(`DROP TABLE "marketplace_nft_rent_records"`);
    await queryRunner.query(`DROP TABLE "marketplace_nft_offers_records"`);
    await queryRunner.query(`DROP TABLE "marketplace"`);
  }
}
