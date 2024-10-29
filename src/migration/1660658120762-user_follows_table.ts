import { MigrationInterface, QueryRunner } from 'typeorm';

export class userFollowsTable1660658120762 implements MigrationInterface {
  name = 'userFollowsTable1660658120762';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_follow" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "userId" uuid, "followsId" uuid, CONSTRAINT "PK_9dcfbeea350dbb23069bea9d7eb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_follow" ADD CONSTRAINT "FK_8070697723d30ede29bdf888187" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_follow" ADD CONSTRAINT "FK_f0b934a7b24741a9f4b2f8a4481" FOREIGN KEY ("followsId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_follow" DROP CONSTRAINT "FK_f0b934a7b24741a9f4b2f8a4481"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_follow" DROP CONSTRAINT "FK_8070697723d30ede29bdf888187"`,
    );
    await queryRunner.query(`DROP TABLE "user_follow"`);
  }
}
