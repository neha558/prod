import { MigrationInterface, QueryRunner } from 'typeorm';

export class emailSubscriptionTable1661446601385 implements MigrationInterface {
  name = 'emailSubscriptionTable1661446601385';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "email_subscription" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "email" text NOT NULL, "origin" text, CONSTRAINT "UQ_fbfd28125a35bcee99ea58f1edb" UNIQUE ("email"), CONSTRAINT "PK_3fab89deebd0355252568c36d0f" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "email_subscription"`);
  }
}
