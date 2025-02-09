import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1739034379066 implements MigrationInterface {
    name = 'Migration1739034379066'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ExaminerIntroductions" ("id" character varying(255) NOT NULL, "userId" character varying(255) NOT NULL, "banner" character varying(255), "description" text, "introduction" text, "workPlace" text, "workAddress" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_6e6456f61578bbe5b2a1f01933" UNIQUE ("userId"), CONSTRAINT "PK_8c7a8d1c1838b22da6c34666ea4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Exams" DROP CONSTRAINT "FK_4d6275476ec7ab24c0e9643763a"`);
        await queryRunner.query(`ALTER TABLE "Exams" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ExaminerIntroductions" ADD CONSTRAINT "FK_6e6456f61578bbe5b2a1f019338" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Exams" ADD CONSTRAINT "FK_4d6275476ec7ab24c0e9643763a" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Exams" DROP CONSTRAINT "FK_4d6275476ec7ab24c0e9643763a"`);
        await queryRunner.query(`ALTER TABLE "ExaminerIntroductions" DROP CONSTRAINT "FK_6e6456f61578bbe5b2a1f019338"`);
        await queryRunner.query(`ALTER TABLE "Exams" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Exams" ADD CONSTRAINT "FK_4d6275476ec7ab24c0e9643763a" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`DROP TABLE "ExaminerIntroductions"`);
    }

}
