import { MigrationInterface, QueryRunner } from 'typeorm';

export class newRewardHoldingsHistory1668402680934
  implements MigrationInterface
{
  name = 'newRewardHoldingsHistory1668402680934';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "nft_holding_rewards_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "start_time_to_consider" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "end_time_to_consider" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "unique_key" text NOT NULL, "total_claimable_rewards" double precision NOT NULL, "total_supply" integer NOT NULL, "type_of_card" text NOT NULL, "request_id" text, "tx_id" text, "nftHoldingId" uuid, CONSTRAINT "UQ_1dff957bc1bc1ac66d276e54e7d" UNIQUE ("unique_key"), CONSTRAINT "PK_859c54af904a07c921fefe5b9d1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" DROP COLUMN "request_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" DROP COLUMN "tx_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" DROP COLUMN "total_supply"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" DROP COLUMN "type_of_card"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" ADD "request_id" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" ADD "tx_id" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" ADD "total_supply" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" ADD "type_of_card" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards_records" ADD CONSTRAINT "FK_a57afbf8d3919cd687431e4e5be" FOREIGN KEY ("nftHoldingId") REFERENCES "nft_holding_rewards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards_records" DROP CONSTRAINT "FK_a57afbf8d3919cd687431e4e5be"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" DROP COLUMN "type_of_card"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" DROP COLUMN "total_supply"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" DROP COLUMN "tx_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" DROP COLUMN "request_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" ADD "type_of_card" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" ADD "total_supply" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" ADD "tx_id" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" ADD "request_id" text`,
    );
    await queryRunner.query(`DROP TABLE "nft_holding_rewards_records"`);
  }
}
