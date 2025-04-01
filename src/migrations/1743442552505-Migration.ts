import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1743442552505 implements MigrationInterface {
    name = 'Migration1743442552505'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "GradeFeedbacks" ("id" character varying(255) NOT NULL, "examQuestionId" character varying(255) NOT NULL, "score" text DEFAULT '', "type" double precision NOT NULL DEFAULT '0', "feedback" text, CONSTRAINT "PK_ce1875266490cee0391c3f4ccad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Exams" ADD "isGradedWritingWithAI" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "Exams" ADD "isGradedSpeakingWithAI" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "Exams" ADD "isGradedWritingWithPerson" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "Exams" ADD "isGradedSpeakingWithPerson" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "GradeFeedbacks" ADD CONSTRAINT "FK_16a414b09a1e02ddfa3570efb8e" FOREIGN KEY ("examQuestionId") REFERENCES "ExamQuestions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "GradeFeedbacks" DROP CONSTRAINT "FK_16a414b09a1e02ddfa3570efb8e"`);
        await queryRunner.query(`ALTER TABLE "Exams" DROP COLUMN "isGradedSpeakingWithPerson"`);
        await queryRunner.query(`ALTER TABLE "Exams" DROP COLUMN "isGradedWritingWithPerson"`);
        await queryRunner.query(`ALTER TABLE "Exams" DROP COLUMN "isGradedSpeakingWithAI"`);
        await queryRunner.query(`ALTER TABLE "Exams" DROP COLUMN "isGradedWritingWithAI"`);
        await queryRunner.query(`DROP TABLE "GradeFeedbacks"`);
    }

}
