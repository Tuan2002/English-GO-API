import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1739716285252 implements MigrationInterface {
    name = 'Migration1739716285252'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Evaluates" ("id" character varying(255) NOT NULL, "userId" character varying(255) NOT NULL, "starNumber" integer NOT NULL, "description" character varying(1000) NOT NULL, "isShow" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c7392c05c27a5aade8fa93db914" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Evaluates" ADD CONSTRAINT "FK_f54a2ba0df500cf7c36b8135e2f" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Evaluates" DROP CONSTRAINT "FK_f54a2ba0df500cf7c36b8135e2f"`);
        await queryRunner.query(`DROP TABLE "Evaluates"`);
    }

}
