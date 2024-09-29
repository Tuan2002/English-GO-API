import AppDataSource from "@/data-source";
import { Category } from "@/entity/Category";
import { Function } from "@/entity/Function";
import { GroupRole } from "@/entity/GroupRole";
import { Level } from "@/entity/Level";
import { Permission } from "@/entity/Permission";
import { Question } from "@/entity/Question";
import { Skill } from "@/entity/Skill";
import { User } from "@/entity/User";

const FunctionRepo = AppDataSource.getRepository(Function);
const GroupRoleRepo = AppDataSource.getRepository(GroupRole);
const PermissionRepo = AppDataSource.getRepository(Permission);
const UserRepo = AppDataSource.getRepository(User);
const SkillRepo = AppDataSource.getRepository(Skill);
const LevelRepo = AppDataSource.getRepository(Level);
const CategoryRepo = AppDataSource.getRepository(Category);
const QuestionRepo = AppDataSource.getRepository(Question);

export const Repo = {
  FunctionRepo,
  GroupRoleRepo,
  PermissionRepo,
  UserRepo,
  SkillRepo,
  LevelRepo,
  CategoryRepo,
  QuestionRepo,
};
