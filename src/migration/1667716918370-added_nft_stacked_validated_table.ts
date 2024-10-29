import { MigrationInterface, QueryRunner } from 'typeorm';

export class addedNftStackedValidatedTable1667716918370
  implements MigrationInterface
{
  name = 'addedNftStackedValidatedTable1667716918370';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "nft_stacked_validated" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "internalComment" character varying(300), "categoryId" integer NOT NULL, "tokenId" integer NOT NULL, "txId" text NOT NULL, CONSTRAINT "UQ_c8352aa11b98bf6da7f20ee4ac3" UNIQUE ("tokenId"), CONSTRAINT "PK_a34c4f6cc3f93481c10c7f7a227" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "nft_stacked_validated"`);
  }
}
