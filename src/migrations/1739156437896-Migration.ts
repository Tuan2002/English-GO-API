import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1739156437896 implements MigrationInterface {
    name = 'Migration1739156437896'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "PlanTypes" ("id" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "displayName" character varying(255) NOT NULL, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(255), "updatedBy" character varying(255), CONSTRAINT "PK_b73fa2f400903296d5de4636570" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "PlanAttributes" ("id" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "displayName" character varying(255) NOT NULL, "dataType" character varying(255) NOT NULL, "note" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDefault" boolean NOT NULL DEFAULT false, "planTypeId" character varying(255), CONSTRAINT "PK_34125b23b66e045746220a8e1dd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "PlanDetails" ("id" character varying(255) NOT NULL, "planId" character varying(255) NOT NULL, "attributeId" character varying(255) NOT NULL, "value" character varying(255) NOT NULL, "note" character varying(1000), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(255), "updatedBy" character varying(255), CONSTRAINT "PK_204e5057ddd6ebee9a07f7e246e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Plans" ("id" character varying(255) NOT NULL, "planTypeId" character varying(255) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(255), "updatedBy" character varying(255), CONSTRAINT "PK_a659f1806d1b1fd78fe46766332" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "PlanAttributes" ADD CONSTRAINT "FK_94aa6ee3d8db72df8128c2d2228" FOREIGN KEY ("planTypeId") REFERENCES "PlanTypes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PlanDetails" ADD CONSTRAINT "FK_c33f75e4767f5a9f4178caf9690" FOREIGN KEY ("planId") REFERENCES "Plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PlanDetails" ADD CONSTRAINT "FK_ea6e37a6c4cc5226de9893a5262" FOREIGN KEY ("attributeId") REFERENCES "PlanAttributes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Plans" ADD CONSTRAINT "FK_db2c35d87baa4c7067e2f580bdb" FOREIGN KEY ("planTypeId") REFERENCES "PlanTypes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Plans" DROP CONSTRAINT "FK_db2c35d87baa4c7067e2f580bdb"`);
        await queryRunner.query(`ALTER TABLE "PlanDetails" DROP CONSTRAINT "FK_ea6e37a6c4cc5226de9893a5262"`);
        await queryRunner.query(`ALTER TABLE "PlanDetails" DROP CONSTRAINT "FK_c33f75e4767f5a9f4178caf9690"`);
        await queryRunner.query(`ALTER TABLE "PlanAttributes" DROP CONSTRAINT "FK_94aa6ee3d8db72df8128c2d2228"`);
        await queryRunner.query(`DROP TABLE "Plans"`);
        await queryRunner.query(`DROP TABLE "PlanDetails"`);
        await queryRunner.query(`DROP TABLE "PlanAttributes"`);
        await queryRunner.query(`DROP TABLE "PlanTypes"`);
    }

}
