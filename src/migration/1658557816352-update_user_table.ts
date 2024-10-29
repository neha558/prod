import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateUserTable1658557816352 implements MigrationInterface {
  name = 'updateUserTable1658557816352';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "user_name" text`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_074a1f262efaca6aba16f7ed920" UNIQUE ("user_name")`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "profile_image" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profile_image"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_074a1f262efaca6aba16f7ed920"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "user_name"`);
  }
}
