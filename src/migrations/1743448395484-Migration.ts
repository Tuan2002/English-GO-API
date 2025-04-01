import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1743448395484 implements MigrationInterface {
    name = 'Migration1743448395484'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "GradeFeedbacks" DROP COLUMN "score"`);
        await queryRunner.query(`ALTER TABLE "GradeFeedbacks" ADD "score" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "GradeFeedbacks" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "GradeFeedbacks" ADD "type" character varying(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "GradeFeedbacks" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "GradeFeedbacks" ADD "type" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "GradeFeedbacks" DROP COLUMN "score"`);
        await queryRunner.query(`ALTER TABLE "GradeFeedbacks" ADD "score" text DEFAULT ''`);
    }

}
