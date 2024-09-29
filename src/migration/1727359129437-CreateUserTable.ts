import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1727359129437 implements MigrationInterface {
    name = 'CreateUserTable1727359129437'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Users" ("id" character varying NOT NULL, "email" character varying(255) NOT NULL, "username" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "fullName" character varying(1000) NOT NULL, "groupRoleId" character varying(255) NOT NULL, "phoneNumber" character varying(15), "birthday" character varying, "gender" character(1) NOT NULL DEFAULT 'M', "avatar" character varying(1000), "banner" character varying(1000), "isBlocked" boolean NOT NULL DEFAULT false, "isDeleted" boolean NOT NULL DEFAULT false, "isUpdated" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "GroupRoles" ("id" character varying(255) NOT NULL, "name" character varying(1000) NOT NULL, "displayName" character varying(1000) NOT NULL, "description" text, "isDeleted" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1103dc10757e0adc21eebc1fb3f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Permissions" ("id" character varying(255) NOT NULL, "groupRoleId" character varying(255) NOT NULL, "functionId" character varying(255) NOT NULL, "isDeleted" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e83fa8a46bd5a3bfaa095d40812" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Functions" ("id" character varying(255) NOT NULL, "name" character varying(1000) NOT NULL, "displayName" character varying(1000) NOT NULL, "description" text, "functionLink" character varying(255) NOT NULL, "isDeleted" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1023c0174768a9301e3b548f340" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Users" ADD CONSTRAINT "FK_fce2a8b62c947f5d4c6dbfac75e" FOREIGN KEY ("groupRoleId") REFERENCES "GroupRoles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Permissions" ADD CONSTRAINT "FK_0f8fb9bcde11ec6ab9303d1ca96" FOREIGN KEY ("functionId") REFERENCES "Functions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Permissions" ADD CONSTRAINT "FK_065962231b13dbaf2e803eb2b9d" FOREIGN KEY ("groupRoleId") REFERENCES "GroupRoles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Permissions" DROP CONSTRAINT "FK_065962231b13dbaf2e803eb2b9d"`);
        await queryRunner.query(`ALTER TABLE "Permissions" DROP CONSTRAINT "FK_0f8fb9bcde11ec6ab9303d1ca96"`);
        await queryRunner.query(`ALTER TABLE "Users" DROP CONSTRAINT "FK_fce2a8b62c947f5d4c6dbfac75e"`);
        await queryRunner.query(`DROP TABLE "Functions"`);
        await queryRunner.query(`DROP TABLE "Permissions"`);
        await queryRunner.query(`DROP TABLE "GroupRoles"`);
        await queryRunner.query(`DROP TABLE "Users"`);
    }

}
