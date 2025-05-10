import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1745664122743 implements MigrationInterface {
    name = 'Migration1745664122743'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "RegisterGradeExams" ("id" character varying(255) NOT NULL, "examId" character varying(255) NOT NULL, "skillId" character varying(255) NOT NULL, "examinerId" character varying(255) NOT NULL, "contestantId" character varying(255) NOT NULL, "status" character varying(255) NOT NULL, CONSTRAINT "PK_9760c2b418f01dfad1e0acfa0ae" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "GradeFeedbacks" ADD "registerGradeExamId" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "RegisterGradeExams" ADD CONSTRAINT "FK_e5bf01ced129cd34a571874cd31" FOREIGN KEY ("examId") REFERENCES "Exams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "RegisterGradeExams" ADD CONSTRAINT "FK_5246206558f6451de79cc2db4b1" FOREIGN KEY ("examinerId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "RegisterGradeExams" ADD CONSTRAINT "FK_20ce50349df681e8349184603af" FOREIGN KEY ("contestantId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "RegisterGradeExams" DROP CONSTRAINT "FK_20ce50349df681e8349184603af"`);
        await queryRunner.query(`ALTER TABLE "RegisterGradeExams" DROP CONSTRAINT "FK_5246206558f6451de79cc2db4b1"`);
        await queryRunner.query(`ALTER TABLE "RegisterGradeExams" DROP CONSTRAINT "FK_e5bf01ced129cd34a571874cd31"`);
        await queryRunner.query(`ALTER TABLE "GradeFeedbacks" DROP COLUMN "registerGradeExamId"`);
        await queryRunner.query(`DROP TABLE "RegisterGradeExams"`);
    }

}
