import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1736475256397 implements MigrationInterface {
    name = 'Migration1736475256397'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Feedbacks" ("id" character varying(255) NOT NULL, "fullName" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "phoneNumber" character varying(255) NOT NULL, "feedback" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2a57575bac40d1a302ef02a8530" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Users" ADD "lastLogin" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "Exams" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Exams" ADD CONSTRAINT "FK_4d6275476ec7ab24c0e9643763a" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Exams" DROP CONSTRAINT "FK_4d6275476ec7ab24c0e9643763a"`);
        await queryRunner.query(`ALTER TABLE "Exams" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "lastLogin"`);
        await queryRunner.query(`DROP TABLE "Feedbacks"`);
    }

}
