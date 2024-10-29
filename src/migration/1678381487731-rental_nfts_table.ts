import { MigrationInterface, QueryRunner } from 'typeorm';

export class rentalNftsTable1678381487731 implements MigrationInterface {
  name = 'rentalNftsTable1678381487731';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "nfts_rental_pool" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "no" text NOT NULL, "counter" integer NOT NULL, "used" integer NOT NULL, "rewards" double precision NOT NULL, CONSTRAINT "UQ_0160e18bf297e4cfda8bd6fc348" UNIQUE ("no"), CONSTRAINT "PK_966da1957e1cf3022603a82c072" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "nft_rental_user_pool" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "nft_id" text NOT NULL, "no" text NOT NULL, "account_address" text NOT NULL, "rewarded" boolean NOT NULL, "rewards" double precision NOT NULL, CONSTRAINT "PK_bbb1fab104f4370d1084b1d4ec4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" ADD "is_added_in_rental_pool" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_owners_relation" DROP COLUMN "is_added_in_rental_pool"`,
    );
    await queryRunner.query(`DROP TABLE "nft_rental_user_pool"`);
    await queryRunner.query(`DROP TABLE "nfts_rental_pool"`);
  }
}
