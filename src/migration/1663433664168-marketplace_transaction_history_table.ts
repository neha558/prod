import { MigrationInterface, QueryRunner } from 'typeorm';

export class marketplaceTransactionHistoryTable1663433664168
  implements MigrationInterface
{
  name = 'marketplaceTransactionHistoryTable1663433664168';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "marketplace_transactions_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "_id" integer NOT NULL, "token_id" integer NOT NULL, "price" bigint NOT NULL, "type_of_sale" integer NOT NULL, "tx_hash" text NOT NULL, "description" text NOT NULL, "performed_on" bigint NOT NULL, CONSTRAINT "UQ_501e0faab1678cd56298e48cf81" UNIQUE ("tx_hash"), CONSTRAINT "PK_6629aabac5cbe191d8f52e76bb5" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "marketplace_transactions_history"`);
  }
}
