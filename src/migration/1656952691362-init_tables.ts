import { MigrationInterface, QueryRunner } from 'typeorm';

export class initTables1656952691362 implements MigrationInterface {
  name = 'initTables1656952691362';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "nft_owners_relation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "current_owner" text, "nft_id" integer NOT NULL, "tx_hash" text NOT NULL, "unique_event_id" text NOT NULL, "blockchain_data" text, "meta_data" text, "userId" uuid, CONSTRAINT "UQ_d87a4d4071afb155fc1c5f905a4" UNIQUE ("nft_id"), CONSTRAINT "UQ_f711a5748174ca3f41600953396" UNIQUE ("unique_event_id"), CONSTRAINT "PK_550686cc7f7bb1c4f82232565a3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "nft_sales" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "price" double precision NOT NULL DEFAULT '0', "sell_tx" text NOT NULL, "sold" boolean NOT NULL DEFAULT false, "sell_type" text NOT NULL, "sold_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid, "nftId" uuid, "newOwnerId" uuid, CONSTRAINT "UQ_43f95a1f64f54b98cd2161c23f3" UNIQUE ("sell_tx"), CONSTRAINT "UQ_81dd9fcf05dd6a847197f32e6b1" UNIQUE ("sell_type"), CONSTRAINT "PK_f0226b9907967cebd07e2d4bcc1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "nft_offer_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "price" double precision NOT NULL, "accepted" boolean NOT NULL DEFAULT false, "offerId" uuid, "createdById" uuid, "createdForId" uuid, "nftId" uuid, CONSTRAINT "PK_89a3ca192906a6ff1a8bd6168b2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "nft_offer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "name" text NOT NULL, "createdById" uuid, "nftId" uuid, CONSTRAINT "PK_c5e978d5672b79a5320310483b6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "account_address" text NOT NULL, "unique_event_id" text, CONSTRAINT "UQ_2a4d9c9187d72eb26593379fe53" UNIQUE ("account_address"), CONSTRAINT "UQ_362b5d897c7cde893318e1cfbda" UNIQUE ("unique_event_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "nft_auction_bids" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "bid" double precision NOT NULL DEFAULT '0', "is_winner" boolean NOT NULL DEFAULT false, "winner_declared_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "auctionId" uuid, "createdById" uuid, CONSTRAINT "PK_84d3707852a59c8e703573cf8bd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "nft_auction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "starting_price" double precision NOT NULL DEFAULT '0', "bid_increment_price" double precision NOT NULL DEFAULT '0', "name" text NOT NULL, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "end_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdById" uuid, "nftId" uuid, CONSTRAINT "PK_71856858506e5ebf76457ce28b4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" ADD CONSTRAINT "FK_5ce41c9f24ce02d0d1879e34c37" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_sales" ADD CONSTRAINT "FK_3b6e60db54d780ca920e4938431" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_sales" ADD CONSTRAINT "FK_d0a8515f308a4a6b782298aee76" FOREIGN KEY ("nftId") REFERENCES "nft_owners_relation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_sales" ADD CONSTRAINT "FK_74ff37e9c20843659a33fb68136" FOREIGN KEY ("newOwnerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_offer_entries" ADD CONSTRAINT "FK_d82c64aa26aad3c149c1bd89d62" FOREIGN KEY ("offerId") REFERENCES "nft_offer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_offer_entries" ADD CONSTRAINT "FK_9305a27aed273959d2911904a39" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_offer_entries" ADD CONSTRAINT "FK_f0d96cb1279de43c9128c363cbb" FOREIGN KEY ("createdForId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_offer_entries" ADD CONSTRAINT "FK_b9d93410e3cbd95d5f14c85ebf2" FOREIGN KEY ("nftId") REFERENCES "nft_owners_relation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_offer" ADD CONSTRAINT "FK_8fdb3cb2e800011a8b636579594" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_offer" ADD CONSTRAINT "FK_f824a6087251b6621056c2866d5" FOREIGN KEY ("nftId") REFERENCES "nft_owners_relation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_auction_bids" ADD CONSTRAINT "FK_a7195889c3639dca5f23c307f5a" FOREIGN KEY ("auctionId") REFERENCES "nft_auction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_auction_bids" ADD CONSTRAINT "FK_1d0f3e67c4cac8b72e68b8f210c" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_auction" ADD CONSTRAINT "FK_ff11abd56227485aeba01ab8b77" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_auction" ADD CONSTRAINT "FK_17e8a9de2e0b0b1f2f5ce67e6b4" FOREIGN KEY ("nftId") REFERENCES "nft_owners_relation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_auction" DROP CONSTRAINT "FK_17e8a9de2e0b0b1f2f5ce67e6b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_auction" DROP CONSTRAINT "FK_ff11abd56227485aeba01ab8b77"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_auction_bids" DROP CONSTRAINT "FK_1d0f3e67c4cac8b72e68b8f210c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_auction_bids" DROP CONSTRAINT "FK_a7195889c3639dca5f23c307f5a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_offer" DROP CONSTRAINT "FK_f824a6087251b6621056c2866d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_offer" DROP CONSTRAINT "FK_8fdb3cb2e800011a8b636579594"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_offer_entries" DROP CONSTRAINT "FK_b9d93410e3cbd95d5f14c85ebf2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_offer_entries" DROP CONSTRAINT "FK_f0d96cb1279de43c9128c363cbb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_offer_entries" DROP CONSTRAINT "FK_9305a27aed273959d2911904a39"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_offer_entries" DROP CONSTRAINT "FK_d82c64aa26aad3c149c1bd89d62"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_sales" DROP CONSTRAINT "FK_74ff37e9c20843659a33fb68136"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_sales" DROP CONSTRAINT "FK_d0a8515f308a4a6b782298aee76"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_sales" DROP CONSTRAINT "FK_3b6e60db54d780ca920e4938431"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" DROP CONSTRAINT "FK_5ce41c9f24ce02d0d1879e34c37"`,
    );
    await queryRunner.query(`DROP TABLE "nft_auction"`);
    await queryRunner.query(`DROP TABLE "nft_auction_bids"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "nft_offer"`);
    await queryRunner.query(`DROP TABLE "nft_offer_entries"`);
    await queryRunner.query(`DROP TABLE "nft_sales"`);
    await queryRunner.query(`DROP TABLE "nft_owners_relation"`);
  }
}
