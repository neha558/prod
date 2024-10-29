import { MigrationInterface, QueryRunner } from 'typeorm';

export class userTableUpdate1660208303696 implements MigrationInterface {
  name = 'userTableUpdate1660208303696';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "full_name" text`);
    await queryRunner.query(`ALTER TABLE "users" ADD "email" text`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "bio" text`);
    await queryRunner.query(`ALTER TABLE "users" ADD "fb_link" text`);
    await queryRunner.query(`ALTER TABLE "users" ADD "instagram_link" text`);
    await queryRunner.query(`ALTER TABLE "users" ADD "twitter_link" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "twitter_link"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "instagram_link"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "fb_link"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bio"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "full_name"`);
  }
}
