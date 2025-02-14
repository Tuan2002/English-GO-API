import AuthService from "@/services/auth/AuthServices";
import JwtService from "@/services/auth/JWTService";
import RoleService from "@/services/auth/RoleService";
import { CategoryService } from "@/services/category/CategoryService";
import DatabaseService from "@/services/database/DatabaseService";
import ExamService from "@/services/exam/ExamServices";
import ExaminerIntroductionService from "@/services/examinerIntroduction/ExaminerIntroductionService";
import FeedbackService from "@/services/feedback/FeedbackService";
import LevelService from "@/services/level/LevelService";
import OrganizationService from "@/services/organization/OrganizationService";
import QuestionService from "@/services/question/QuestionService";
import { ScheduleService } from "@/services/schedule/ScheduleService";
import { SetupService } from "@/services/setup/SetupService";
import SkillService from "@/services/skill/SkillService";
import UserService from "@/services/user/UserServices";
import { asClass, createContainer, InjectionMode } from "awilix";
import "dotenv/config";
import PlanService from "./services/plan/PlanService";
const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});
// Register the services
container.register({
  // Register the Services
  DatabaseService: asClass(DatabaseService).singleton(),
  JwtService: asClass(JwtService).singleton(),
  AuthService: asClass(AuthService).scoped(),
  RoleService: asClass(RoleService).scoped(),
  UserService: asClass(UserService).scoped(),
  CategoryService: asClass(CategoryService).scoped(),
  SkillService: asClass(SkillService).scoped(),
  ScheduleService: asClass(ScheduleService).scoped(),
  QuestionService: asClass(QuestionService).scoped(),
  OrganizationService: asClass(OrganizationService).scoped(),
  LevelService: asClass(LevelService).scoped(),
  FeedbackService: asClass(FeedbackService).scoped(),
  ExamService: asClass(ExamService).scoped(),
  SetupService: asClass(SetupService).scoped(),
  ExaminerIntroductionService: asClass(ExaminerIntroductionService).scoped(),
  PlanService: asClass(PlanService).scoped(),
});
container.resolve("JwtService");
container.resolve("DatabaseService");
export default container;
