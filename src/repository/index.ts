import { v4 as uuidv4 } from "uuid";
import AppDataSource from "@/data-source";
import { Category } from "@/entity/Category";
import { Function } from "@/entity/Function";
import { GroupRole } from "@/entity/GroupRole";
import { Level } from "@/entity/Level";
import { Permission } from "@/entity/Permission";
import { Question } from "@/entity/Question";
import { Skill } from "@/entity/Skill";
import { User } from "@/entity/User";
import { SubQuestion } from "@/entity/SubQuestion";
import { Answer } from "@/entity/Answer";
import { Exam } from "@/entity/Exam";
import { ExamQuestion } from "@/entity/ExamQuestion";
import { ExamSkillStatus } from "@/entity/ExamSkillStatus";
import { Organization } from "@/entity/Organization";
import { ExamSchedule } from "@/entity/ExamSchedule";

const FunctionRepo = AppDataSource.getRepository(Function);
const GroupRoleRepo = AppDataSource.getRepository(GroupRole);
const PermissionRepo = AppDataSource.getRepository(Permission);
const UserRepo = AppDataSource.getRepository(User);
const SkillRepo = AppDataSource.getRepository(Skill);
const LevelRepo = AppDataSource.getRepository(Level);
const CategoryRepo = AppDataSource.getRepository(Category);
const QuestionRepo = AppDataSource.getRepository(Question);
const SubQuesionRepo = AppDataSource.getRepository(SubQuestion);
const AnswerRepo = AppDataSource.getRepository(Answer);
const ExamRepo = AppDataSource.getRepository(Exam);
const ExamQuestionRepo = AppDataSource.getRepository(ExamQuestion);
const ExamSkillStatusRepo = AppDataSource.getRepository(ExamSkillStatus);
const OrganizationRepo = AppDataSource.getRepository(Organization);
const ScheduleRepo = AppDataSource.getRepository(ExamSchedule);

const createUUID = (): string => {
  return uuidv4();
};

export const Repo = {
  FunctionRepo,
  GroupRoleRepo,
  PermissionRepo,
  UserRepo,
  SkillRepo,
  LevelRepo,
  CategoryRepo,
  QuestionRepo,
  SubQuesionRepo,
  AnswerRepo,
  ExamRepo,
  ExamQuestionRepo,
  ExamSkillStatusRepo,
  OrganizationRepo,
  ScheduleRepo,
  createUUID,
};
