import { MigrationInterface, QueryRunner } from 'typeorm';

export class favNftTables1658559078232 implements MigrationInterface {
  name = 'favNftTables1658559078232';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "nft_fav" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "userId" uuid, "nftId" uuid, CONSTRAINT "PK_f26628bea1771152953c7fa26ae" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_074a1f262efaca6aba16f7ed920"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "user_name"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profile_image"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "user_name" text`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_074a1f262efaca6aba16f7ed920" UNIQUE ("user_name")`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "profile_image" text`);
    await queryRunner.query(
      `ALTER TABLE "nft_fav" ADD CONSTRAINT "FK_de8e951f9975073e4b4076cff42" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_fav" ADD CONSTRAINT "FK_7387d2d8756e6885e3dd98ef437" FOREIGN KEY ("nftId") REFERENCES "nft_owners_relation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_fav" DROP CONSTRAINT "FK_7387d2d8756e6885e3dd98ef437"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_fav" DROP CONSTRAINT "FK_de8e951f9975073e4b4076cff42"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profile_image"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_074a1f262efaca6aba16f7ed920"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "user_name"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "profile_image" text`);
    await queryRunner.query(`ALTER TABLE "users" ADD "user_name" text`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_074a1f262efaca6aba16f7ed920" UNIQUE ("user_name")`,
    );
    await queryRunner.query(`DROP TABLE "nft_fav"`);
  }
}
