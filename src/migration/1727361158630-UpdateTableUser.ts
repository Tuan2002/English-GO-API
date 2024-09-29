import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTableUser1727361158630 implements MigrationInterface {
    name = 'UpdateTableUser1727361158630'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" ALTER COLUMN "email" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" ALTER COLUMN "email" SET NOT NULL`);
    }

}
