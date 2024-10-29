import { MigrationInterface, QueryRunner } from 'typeorm';

export class changesInRewardHolidingTableV21668399199091
  implements MigrationInterface
{
  name = 'changesInRewardHolidingTableV21668399199091';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" ADD "end_time_to_consider" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_holding_rewards" DROP COLUMN "end_time_to_consider"`,
    );
  }
}
