import { MigrationInterface, QueryRunner } from 'typeorm';

export class addedClaimRewardsTable1668705865759 implements MigrationInterface {
  name = 'addedClaimRewardsTable1668705865759';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "nft_rewards_claims" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "account_address" text NOT NULL, "tx_hash" text NOT NULL, "amount" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_b6b7c2bf278c810f3bfb660f100" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "nft_rewards_claims"`);
  }
}
