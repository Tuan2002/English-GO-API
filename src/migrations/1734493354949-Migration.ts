import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1734493354949 implements MigrationInterface {
    name = 'Migration1734493354949'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Answers" ("id" character varying(255) NOT NULL, "subQuestionId" character varying(255) NOT NULL, "answerContent" text NOT NULL, "order" integer NOT NULL DEFAULT '0', "isCorrect" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(255), "updatedBy" character varying(255), CONSTRAINT "PK_e9ce77a9a6326d042fc833d63f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "SubQuestions" ("id" character varying(255) NOT NULL, "questionId" character varying(255) NOT NULL, "content" text NOT NULL, "note" text, "correctAnswer" character varying(255) NOT NULL, "order" integer NOT NULL DEFAULT '0', "isDeleted" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(255), "updatedBy" character varying(255), CONSTRAINT "PK_56ba89af24a3200fa942a04f6f6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Questions" ("id" character varying(255) NOT NULL, "skillId" character varying(255) NOT NULL, "levelId" character varying(255) NOT NULL, "categoryId" character varying(255) NOT NULL, "questionContent" text NOT NULL, "questionNote" text, "questionImage" character varying(1000), "description" text, "attachedFile" character varying(1000), "isDeleted" boolean NOT NULL DEFAULT false, "isActive" boolean DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(255), "updatedBy" character varying(255), CONSTRAINT "PK_8f81bcc6305787ab7dd0d828e21" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Categories" ("id" character varying(255) NOT NULL, "name" character varying(1000) NOT NULL, "description" text, "image" character varying(255), "isDeleted" boolean NOT NULL DEFAULT false, "isActive" boolean DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(255), "updatedBy" character varying(255), "skillId" character varying(255) NOT NULL, "levelId" character varying(255) NOT NULL, CONSTRAINT "PK_537b5c00afe7427c4fc9434cd59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Levels" ("id" character varying(255) NOT NULL, "skillId" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "displayName" character varying(255) NOT NULL, "description" text, "image" character varying(255), "subQuestionNumber" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_18322e8ea03ecac3d45160cb96d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ExamResultWritings" ("id" character varying(255) NOT NULL, "examQuestionId" character varying(255) NOT NULL, "data" text DEFAULT '', "point" double precision NOT NULL DEFAULT '0', "feedback" text, "isRated" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_16648a381bd591bc55712b703bf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ExamResultListenings" ("id" character varying(255) NOT NULL, "examQuestionId" character varying(255) NOT NULL, "subQuestionId" character varying(255) NOT NULL, "answerId" character varying(255) NOT NULL, CONSTRAINT "PK_d64e94993bf3a7bd2ecf18a3fe3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ExamResultSpeakings" ("id" character varying(255) NOT NULL, "examQuestionId" character varying(255) NOT NULL, "data" text DEFAULT '', "point" double precision NOT NULL DEFAULT '0', "feedback" text, "isRated" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_57fd18c0e8c521487109bc9f025" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ExamResultReadings" ("id" character varying(255) NOT NULL, "examQuestionId" character varying(255) NOT NULL, "subQuestionId" character varying(255) NOT NULL, "answerId" character varying(255) NOT NULL, CONSTRAINT "PK_fc287357369724163792d0721c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ExamQuestions" ("id" character varying(255) NOT NULL, "examId" character varying(255) NOT NULL, "questionId" character varying(255) NOT NULL, "levelId" character varying(255), CONSTRAINT "PK_422f5ab212b0e8aa0dd1ae95d98" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Exams" ("id" character varying(255) NOT NULL, "userId" character varying(1000) NOT NULL, "examCode" character varying(100) NOT NULL, "startTime" character varying(255) NOT NULL, "endTime" character varying(255) NOT NULL, "isDeleted" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "isDone" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(255), "updatedBy" character varying(255), CONSTRAINT "PK_c22084317f28776707eb2be26e3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ExamSkillStatuses" ("id" character varying(255) NOT NULL, "examId" character varying(255) NOT NULL, "skillId" character varying(255) NOT NULL, "startTime" character varying(255) NOT NULL, "endTime" character varying(255) NOT NULL, "status" character varying(255) NOT NULL, "order" integer NOT NULL DEFAULT '0', "score" double precision NOT NULL DEFAULT '0', "totalQuestion" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_3c4fb3ef88f69f9c67d15511656" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Skills" ("id" character varying(255) NOT NULL, "name" character varying(1000) NOT NULL, "displayName" character varying(1000) NOT NULL, "description" text, "image" character varying(255), "order" integer NOT NULL DEFAULT '0', "expiredTime" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_2f371d611f4a29288e11c9b628e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Functions" ("id" character varying(255) NOT NULL, "name" character varying(1000) NOT NULL, "displayName" character varying(1000) NOT NULL, "description" text, "functionLink" character varying(255) NOT NULL, "isDeleted" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1023c0174768a9301e3b548f340" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Permissions" ("id" character varying(255) NOT NULL, "groupRoleId" character varying(255) NOT NULL, "functionId" character varying(255) NOT NULL, "isDeleted" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e83fa8a46bd5a3bfaa095d40812" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "GroupRoles" ("id" character varying(255) NOT NULL, "name" character varying(1000) NOT NULL, "displayName" character varying(1000) NOT NULL, "description" text, "isDeleted" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1103dc10757e0adc21eebc1fb3f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Users" ("id" character varying NOT NULL, "email" character varying(255), "username" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "fullName" character varying(1000) NOT NULL, "groupRoleId" character varying(255) NOT NULL, "phoneNumber" character varying(15), "birthday" character varying, "gender" character(1) NOT NULL DEFAULT 'M', "avatar" character varying(1000), "banner" character varying(1000), "isExternal" boolean, "isBlocked" boolean NOT NULL DEFAULT false, "isDeleted" boolean NOT NULL DEFAULT false, "isUpdated" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ExamSchedules" ("id" character varying(255) NOT NULL, "examPeriod" character varying(255) NOT NULL, "organizationId" character varying(255) NOT NULL, "description" text, "note" text, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, CONSTRAINT "PK_b4e0f5a42c07a0a2aa787422be3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Organizations" ("id" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e0690a31419f6666194423526f2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Answers" ADD CONSTRAINT "FK_5dc002187891308b0c0893a0a94" FOREIGN KEY ("subQuestionId") REFERENCES "SubQuestions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "SubQuestions" ADD CONSTRAINT "FK_efbc3648b4fea19475b86ed93d4" FOREIGN KEY ("questionId") REFERENCES "Questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Questions" ADD CONSTRAINT "FK_95e6dad603563b29b75dce1d56a" FOREIGN KEY ("levelId") REFERENCES "Levels"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Questions" ADD CONSTRAINT "FK_a4b67fd4244a35bd46ef3f294a6" FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Questions" ADD CONSTRAINT "FK_1f08099dc45d08d44e1690e40e9" FOREIGN KEY ("skillId") REFERENCES "Skills"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Categories" ADD CONSTRAINT "FK_0f576d7514efcdca45b33e0dd7c" FOREIGN KEY ("skillId") REFERENCES "Skills"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Categories" ADD CONSTRAINT "FK_174b1bcae586bb4853095384409" FOREIGN KEY ("levelId") REFERENCES "Levels"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Levels" ADD CONSTRAINT "FK_07f9de5819057fc9d30e47a7701" FOREIGN KEY ("skillId") REFERENCES "Skills"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ExamResultWritings" ADD CONSTRAINT "FK_38635c214405fb0c7479dee5f63" FOREIGN KEY ("examQuestionId") REFERENCES "ExamQuestions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ExamResultListenings" ADD CONSTRAINT "FK_09053925ac4121d07f64e4eb98e" FOREIGN KEY ("examQuestionId") REFERENCES "ExamQuestions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ExamResultListenings" ADD CONSTRAINT "FK_776e55fdcc4bc280e8c83794fda" FOREIGN KEY ("subQuestionId") REFERENCES "SubQuestions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ExamResultListenings" ADD CONSTRAINT "FK_0251b04261f17a85a46797c61b2" FOREIGN KEY ("answerId") REFERENCES "Answers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ExamResultSpeakings" ADD CONSTRAINT "FK_f6742945f82f066e369d5abc2b7" FOREIGN KEY ("examQuestionId") REFERENCES "ExamQuestions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ExamResultReadings" ADD CONSTRAINT "FK_93d56d98d606d86aadad5bed8a3" FOREIGN KEY ("examQuestionId") REFERENCES "ExamQuestions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ExamResultReadings" ADD CONSTRAINT "FK_794ced0768f4d129da53a185c04" FOREIGN KEY ("subQuestionId") REFERENCES "SubQuestions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ExamResultReadings" ADD CONSTRAINT "FK_6ee770ac3b315f1d6cfb23b30cf" FOREIGN KEY ("answerId") REFERENCES "Answers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ExamQuestions" ADD CONSTRAINT "FK_347bf23fd0bffc6bfa358e28456" FOREIGN KEY ("examId") REFERENCES "Exams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ExamQuestions" ADD CONSTRAINT "FK_0603f6d0f20dafa87a6444ed5e4" FOREIGN KEY ("questionId") REFERENCES "Questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ExamSkillStatuses" ADD CONSTRAINT "FK_07b9a8307acfdd4acf1ad6e3de0" FOREIGN KEY ("examId") REFERENCES "Exams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ExamSkillStatuses" ADD CONSTRAINT "FK_79c7c76d236f8eb4db04b129575" FOREIGN KEY ("skillId") REFERENCES "Skills"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Permissions" ADD CONSTRAINT "FK_0f8fb9bcde11ec6ab9303d1ca96" FOREIGN KEY ("functionId") REFERENCES "Functions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Permissions" ADD CONSTRAINT "FK_065962231b13dbaf2e803eb2b9d" FOREIGN KEY ("groupRoleId") REFERENCES "GroupRoles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Users" ADD CONSTRAINT "FK_fce2a8b62c947f5d4c6dbfac75e" FOREIGN KEY ("groupRoleId") REFERENCES "GroupRoles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ExamSchedules" ADD CONSTRAINT "FK_5888647abe1ccc430fe4e63dc5c" FOREIGN KEY ("organizationId") REFERENCES "Organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ExamSchedules" DROP CONSTRAINT "FK_5888647abe1ccc430fe4e63dc5c"`);
        await queryRunner.query(`ALTER TABLE "Users" DROP CONSTRAINT "FK_fce2a8b62c947f5d4c6dbfac75e"`);
        await queryRunner.query(`ALTER TABLE "Permissions" DROP CONSTRAINT "FK_065962231b13dbaf2e803eb2b9d"`);
        await queryRunner.query(`ALTER TABLE "Permissions" DROP CONSTRAINT "FK_0f8fb9bcde11ec6ab9303d1ca96"`);
        await queryRunner.query(`ALTER TABLE "ExamSkillStatuses" DROP CONSTRAINT "FK_79c7c76d236f8eb4db04b129575"`);
        await queryRunner.query(`ALTER TABLE "ExamSkillStatuses" DROP CONSTRAINT "FK_07b9a8307acfdd4acf1ad6e3de0"`);
        await queryRunner.query(`ALTER TABLE "ExamQuestions" DROP CONSTRAINT "FK_0603f6d0f20dafa87a6444ed5e4"`);
        await queryRunner.query(`ALTER TABLE "ExamQuestions" DROP CONSTRAINT "FK_347bf23fd0bffc6bfa358e28456"`);
        await queryRunner.query(`ALTER TABLE "ExamResultReadings" DROP CONSTRAINT "FK_6ee770ac3b315f1d6cfb23b30cf"`);
        await queryRunner.query(`ALTER TABLE "ExamResultReadings" DROP CONSTRAINT "FK_794ced0768f4d129da53a185c04"`);
        await queryRunner.query(`ALTER TABLE "ExamResultReadings" DROP CONSTRAINT "FK_93d56d98d606d86aadad5bed8a3"`);
        await queryRunner.query(`ALTER TABLE "ExamResultSpeakings" DROP CONSTRAINT "FK_f6742945f82f066e369d5abc2b7"`);
        await queryRunner.query(`ALTER TABLE "ExamResultListenings" DROP CONSTRAINT "FK_0251b04261f17a85a46797c61b2"`);
        await queryRunner.query(`ALTER TABLE "ExamResultListenings" DROP CONSTRAINT "FK_776e55fdcc4bc280e8c83794fda"`);
        await queryRunner.query(`ALTER TABLE "ExamResultListenings" DROP CONSTRAINT "FK_09053925ac4121d07f64e4eb98e"`);
        await queryRunner.query(`ALTER TABLE "ExamResultWritings" DROP CONSTRAINT "FK_38635c214405fb0c7479dee5f63"`);
        await queryRunner.query(`ALTER TABLE "Levels" DROP CONSTRAINT "FK_07f9de5819057fc9d30e47a7701"`);
        await queryRunner.query(`ALTER TABLE "Categories" DROP CONSTRAINT "FK_174b1bcae586bb4853095384409"`);
        await queryRunner.query(`ALTER TABLE "Categories" DROP CONSTRAINT "FK_0f576d7514efcdca45b33e0dd7c"`);
        await queryRunner.query(`ALTER TABLE "Questions" DROP CONSTRAINT "FK_1f08099dc45d08d44e1690e40e9"`);
        await queryRunner.query(`ALTER TABLE "Questions" DROP CONSTRAINT "FK_a4b67fd4244a35bd46ef3f294a6"`);
        await queryRunner.query(`ALTER TABLE "Questions" DROP CONSTRAINT "FK_95e6dad603563b29b75dce1d56a"`);
        await queryRunner.query(`ALTER TABLE "SubQuestions" DROP CONSTRAINT "FK_efbc3648b4fea19475b86ed93d4"`);
        await queryRunner.query(`ALTER TABLE "Answers" DROP CONSTRAINT "FK_5dc002187891308b0c0893a0a94"`);
        await queryRunner.query(`DROP TABLE "Organizations"`);
        await queryRunner.query(`DROP TABLE "ExamSchedules"`);
        await queryRunner.query(`DROP TABLE "Users"`);
        await queryRunner.query(`DROP TABLE "GroupRoles"`);
        await queryRunner.query(`DROP TABLE "Permissions"`);
        await queryRunner.query(`DROP TABLE "Functions"`);
        await queryRunner.query(`DROP TABLE "Skills"`);
        await queryRunner.query(`DROP TABLE "ExamSkillStatuses"`);
        await queryRunner.query(`DROP TABLE "Exams"`);
        await queryRunner.query(`DROP TABLE "ExamQuestions"`);
        await queryRunner.query(`DROP TABLE "ExamResultReadings"`);
        await queryRunner.query(`DROP TABLE "ExamResultSpeakings"`);
        await queryRunner.query(`DROP TABLE "ExamResultListenings"`);
        await queryRunner.query(`DROP TABLE "ExamResultWritings"`);
        await queryRunner.query(`DROP TABLE "Levels"`);
        await queryRunner.query(`DROP TABLE "Categories"`);
        await queryRunner.query(`DROP TABLE "Questions"`);
        await queryRunner.query(`DROP TABLE "SubQuestions"`);
        await queryRunner.query(`DROP TABLE "Answers"`);
    }

}
