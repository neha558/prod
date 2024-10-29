import { MigrationInterface, QueryRunner } from 'typeorm';

export class stakersTable1678598745610 implements MigrationInterface {
  name = 'stakersTable1678598745610';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "stackers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "account_address" text NOT NULL, "balance" double precision DEFAULT '0', "rewards_released" double precision DEFAULT '0', CONSTRAINT "UQ_1d6e1f554c5ad7579cb4be78b1a" UNIQUE ("account_address"), CONSTRAINT "PK_61e82307cb660d5df528884568a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "stackers_token_ids" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "token_id" integer NOT NULL, "token_staking_time" integer, "stackerId" uuid, CONSTRAINT "PK_f45994787605cce9b0a12140d0e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "stackers_token_ids" ADD CONSTRAINT "FK_a97d922bcfca0ee2a7bf1abed14" FOREIGN KEY ("stackerId") REFERENCES "stackers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stackers_token_ids" DROP CONSTRAINT "FK_a97d922bcfca0ee2a7bf1abed14"`,
    );
    await queryRunner.query(`DROP TABLE "stackers_token_ids"`);
    await queryRunner.query(`DROP TABLE "stackers"`);
  }
}
