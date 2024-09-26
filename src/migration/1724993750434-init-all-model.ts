import { MigrationInterface, QueryRunner } from "typeorm";

export class InitAllModel1724993750434 implements MigrationInterface {
    name = 'InitAllModel1724993750434'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "CvCreateds" ("id" character varying(255) NOT NULL, "userId" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "profession" character varying(255) NOT NULL, "position" character varying(255) NOT NULL, "appliedPosition" character varying(255) NOT NULL, "cvSample" character varying(255), "avatar" character varying(255), "phoneNumber" character varying(255), "email" character varying(255), "facebook" character varying(255), "address" character varying(255), "fullName" character varying(255), "birthday" date, "infomationPosition" text, "careerTarget" text, "referrer" text, "educations" text, "experiences" text, "skills" text, "activities" text, "certificates" text, "awards" text, "products" text, "proofImage" character varying(255), "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "isActive" boolean NOT NULL DEFAULT true, "isPublic" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_e6ea747e01cf0aa9223191d8add" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Awards" ("id" character varying(255) NOT NULL, "userId" character varying(255) NOT NULL, "name" character varying(1000) NOT NULL, "organization" character varying(1000) NOT NULL, "proofImage" character varying(1000), "startTime" date NOT NULL, "endTime" date, "description" text, CONSTRAINT "PK_8e619b7e81fa1ccd3ea5fee0893" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Products" ("id" character varying(255) NOT NULL, "userId" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "position" character varying(255) NOT NULL, "profession" character varying(255) NOT NULL, "proofImage" character varying(255), "startTime" date NOT NULL, "endTime" date NOT NULL, "description" text, CONSTRAINT "PK_36a07cc432789830e7fb7b58a83" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Activities" ("id" character varying(255) NOT NULL, "userId" character varying(255) NOT NULL, "name" character varying(1000) NOT NULL, "organization" character varying(1000) NOT NULL, "position" character varying(255) NOT NULL, "proofImage" character varying(1000), "startTime" date NOT NULL, "endTime" date, "isActive" boolean NOT NULL, "description" text, CONSTRAINT "PK_68241637da2837e6d5a4db6f806" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Certificates" ("id" character varying(255) NOT NULL, "userId" character varying(255) NOT NULL, "name" character varying(1000) NOT NULL, "organization" character varying(1000), "proofImage" character varying(1000), "startTime" date NOT NULL, "endTime" date, "description" text, CONSTRAINT "PK_cb3d265554042ad86892cf184f8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "SkillLevels" ("id" character varying(255) NOT NULL, "level" character varying(255) NOT NULL, "description" text, CONSTRAINT "PK_12557cc42371e72450be106029d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Skills" ("id" character varying(255) NOT NULL, "userId" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "level" character varying(255) NOT NULL, "description" text, CONSTRAINT "PK_2f371d611f4a29288e11c9b628e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Experiences" ("id" character varying(255) NOT NULL, "userId" character varying(255) NOT NULL, "company" character varying(255) NOT NULL, "position" character varying(255) NOT NULL, "startTime" date NOT NULL, "endTime" date NOT NULL, "isWorking" boolean NOT NULL, "description" text, CONSTRAINT "PK_cb8b53ab2b02a86c9332e91acdc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Positions" ("id" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "description" text, "isDeleted" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0f4f3bbe136c19f47cd0f4e5672" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Educations" ("id" character varying(255) NOT NULL, "userId" character varying(255) NOT NULL, "school" character varying(255) NOT NULL, "specialzed" character varying(255) NOT NULL, "startTime" date NOT NULL, "endTime" date NOT NULL, "isWorking" boolean NOT NULL, "description" text, CONSTRAINT "PK_b51f688a135a51769d49ea1779d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Professions" ("id" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "description" text, "isDeleted" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_51fd205c4df2b738aac16367544" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Profiles" ("id" character varying(255) NOT NULL, "userId" character varying(255) NOT NULL, "address" character varying(1000), "description" text, "phoneNumber" character varying(15), "email" character varying(255), "birthday" date, "sex" character(1) NOT NULL DEFAULT 'M', "banner" character varying(255), "profession" character varying(255), "position" character varying(255), CONSTRAINT "PK_1cafb33ec125c423acbde2be7a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Users" ("id" character varying NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "fullName" character varying(1000) NOT NULL, "avatar" character varying(1000) NOT NULL, "groupRoleId" character varying(255) NOT NULL, "isBlocked" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "isDeleted" boolean NOT NULL DEFAULT false, "isUpdated" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "GroupRoles" ("id" character varying(255) NOT NULL, "name" character varying(1000) NOT NULL, "displayName" character varying(1000) NOT NULL, "description" text, "isDeleted" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1103dc10757e0adc21eebc1fb3f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Permissions" ("id" character varying(255) NOT NULL, "groupRoleId" character varying(255) NOT NULL, "functionId" character varying(255) NOT NULL, "isDeleted" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e83fa8a46bd5a3bfaa095d40812" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Functions" ("id" character varying(255) NOT NULL, "name" character varying(1000) NOT NULL, "displayName" character varying(1000) NOT NULL, "description" text, "functionLink" character varying(255) NOT NULL, "isDeleted" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1023c0174768a9301e3b548f340" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Profiles" ADD CONSTRAINT "FK_2222d166a9adb00a5302beae942" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Users" ADD CONSTRAINT "FK_fce2a8b62c947f5d4c6dbfac75e" FOREIGN KEY ("groupRoleId") REFERENCES "GroupRoles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Permissions" ADD CONSTRAINT "FK_0f8fb9bcde11ec6ab9303d1ca96" FOREIGN KEY ("functionId") REFERENCES "Functions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Permissions" ADD CONSTRAINT "FK_065962231b13dbaf2e803eb2b9d" FOREIGN KEY ("groupRoleId") REFERENCES "GroupRoles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Permissions" DROP CONSTRAINT "FK_065962231b13dbaf2e803eb2b9d"`);
        await queryRunner.query(`ALTER TABLE "Permissions" DROP CONSTRAINT "FK_0f8fb9bcde11ec6ab9303d1ca96"`);
        await queryRunner.query(`ALTER TABLE "Users" DROP CONSTRAINT "FK_fce2a8b62c947f5d4c6dbfac75e"`);
        await queryRunner.query(`ALTER TABLE "Profiles" DROP CONSTRAINT "FK_2222d166a9adb00a5302beae942"`);
        await queryRunner.query(`DROP TABLE "Functions"`);
        await queryRunner.query(`DROP TABLE "Permissions"`);
        await queryRunner.query(`DROP TABLE "GroupRoles"`);
        await queryRunner.query(`DROP TABLE "Users"`);
        await queryRunner.query(`DROP TABLE "Profiles"`);
        await queryRunner.query(`DROP TABLE "Professions"`);
        await queryRunner.query(`DROP TABLE "Educations"`);
        await queryRunner.query(`DROP TABLE "Positions"`);
        await queryRunner.query(`DROP TABLE "Experiences"`);
        await queryRunner.query(`DROP TABLE "Skills"`);
        await queryRunner.query(`DROP TABLE "SkillLevels"`);
        await queryRunner.query(`DROP TABLE "Certificates"`);
        await queryRunner.query(`DROP TABLE "Activities"`);
        await queryRunner.query(`DROP TABLE "Products"`);
        await queryRunner.query(`DROP TABLE "Awards"`);
        await queryRunner.query(`DROP TABLE "CvCreateds"`);
    }

}
