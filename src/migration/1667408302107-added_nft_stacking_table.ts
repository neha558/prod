import { MigrationInterface, QueryRunner } from 'typeorm';

export class addedNftStackingTable1667408302107 implements MigrationInterface {
  name = 'addedNftStackingTable1667408302107';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "nft_stacked" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "rates" double precision NOT NULL, "stacked_on" TIMESTAMP WITH TIME ZONE NOT NULL, "ends" TIMESTAMP WITH TIME ZONE NOT NULL, "is_category_verified" boolean NOT NULL, "stakingTime" integer NOT NULL DEFAULT '0', "totalReward" integer NOT NULL DEFAULT '0', "stackedById" uuid, "nftId" uuid, CONSTRAINT "PK_06c377d732585238f15e1a00cbc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_stacked" ADD CONSTRAINT "FK_5f2e3a1206c2b93318d31d98eca" FOREIGN KEY ("stackedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_stacked" ADD CONSTRAINT "FK_6d30b64f75768dd5563e857fd24" FOREIGN KEY ("nftId") REFERENCES "nft_owners_relation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_stacked" DROP CONSTRAINT "FK_6d30b64f75768dd5563e857fd24"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_stacked" DROP CONSTRAINT "FK_5f2e3a1206c2b93318d31d98eca"`,
    );
    await queryRunner.query(`DROP TABLE "nft_stacked"`);
  }
}
