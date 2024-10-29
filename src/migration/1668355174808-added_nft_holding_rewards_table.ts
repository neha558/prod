import { MigrationInterface, QueryRunner } from 'typeorm';

export class addedNftHoldingRewardsTable1668355174808
  implements MigrationInterface
{
  name = 'addedNftHoldingRewardsTable1668355174808';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "nft_holding_rewards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "nft" integer NOT NULL, "holder" text NOT NULL, "unique_key" text NOT NULL, "total_claimable_rewards" double precision NOT NULL, "total_claimed_rewards" double precision NOT NULL, "start_time_to_consider" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_69a3699b6d549a2e05da86fbf2b" UNIQUE ("unique_key"), CONSTRAINT "PK_dd38c9988a419623d7c52bcc5f2" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "nft_holding_rewards"`);
  }
}
