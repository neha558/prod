import { MigrationInterface, QueryRunner } from 'typeorm';

export class updatedNftStakingTable1667410537901 implements MigrationInterface {
  name = 'updatedNftStakingTable1667410537901';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_stacked" ADD "counter" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_stacked" ADD CONSTRAINT "UQ_c10fa6e269751b5a0c698bd2813" UNIQUE ("counter")`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_stacked" ADD "txId" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_stacked" ADD CONSTRAINT "UQ_9739ba3424ea127d8ec70ad3d8a" UNIQUE ("txId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_stacked" DROP CONSTRAINT "UQ_9739ba3424ea127d8ec70ad3d8a"`,
    );
    await queryRunner.query(`ALTER TABLE "nft_stacked" DROP COLUMN "txId"`);
    await queryRunner.query(
      `ALTER TABLE "nft_stacked" DROP CONSTRAINT "UQ_c10fa6e269751b5a0c698bd2813"`,
    );
    await queryRunner.query(`ALTER TABLE "nft_stacked" DROP COLUMN "counter"`);
  }
}
