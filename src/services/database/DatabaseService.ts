import { ENV } from "@/constants/env";
import { Answer } from "@/entity/Answer";
import { Category } from "@/entity/Category";
import { Evaluate } from "@/entity/Evaluate";
import { Exam } from "@/entity/Exam";
import { ExaminerIntroduction } from "@/entity/ExaminerIntroduction";
import { ExamQuestion } from "@/entity/ExamQuestion";
import { ExamResultListening } from "@/entity/ExamResultListening";
import { ExamResultReading } from "@/entity/ExamResultReading";
import { ExamResultSpeaking } from "@/entity/ExamResultSpeaking";
import { ExamResultWriting } from "@/entity/ExamResultWriting";
import { ExamSchedule } from "@/entity/ExamSchedule";
import { ExamSkillStatus } from "@/entity/ExamSkillStatus";
import { Feedback } from "@/entity/Feedback";
import { Function } from "@/entity/Function";
import { GradeFeedback } from "@/entity/GradeFeedback";
import { GroupRole } from "@/entity/GroupRole";
import { Level } from "@/entity/Level";
import { Organization } from "@/entity/Organization";
import { Permission } from "@/entity/Permission";
import { Plan } from "@/entity/Plan";
import { PlanAttribute } from "@/entity/PlanAttribute";
import { PlanDetail } from "@/entity/PlanDetail";
import { PlanType } from "@/entity/PlanType";
import { Question } from "@/entity/Question";
import { RegisterGradeExam } from "@/entity/RegisterGradeExam";
import { Skill } from "@/entity/Skill";
import { SubQuestion } from "@/entity/SubQuestion";
import { User } from "@/entity/User";
import logger from "@/helpers/logger";
import dataSource from "@/ormconfig";
import "reflect-metadata";
import { DataSource, QueryRunner, Repository } from "typeorm";

class DatabaseService {
  private _dataSource: DataSource;
  public FunctionRepo: Repository<Function>;
  public GroupRoleRepo: Repository<GroupRole>;
  public PermissionRepo: Repository<Permission>;
  public UserRepo: Repository<User>;
  public SkillRepo: Repository<Skill>;
  public LevelRepo: Repository<Level>;
  public CategoryRepo: Repository<Category>;
  public QuestionRepo: Repository<Question>;
  public SubQuesionRepo: Repository<SubQuestion>;
  public AnswerRepo: Repository<Answer>;
  public ExamRepo: Repository<Exam>;
  public ExamQuestionRepo: Repository<ExamQuestion>;
  public ExamSkillStatusRepo: Repository<ExamSkillStatus>;
  public ExamResultListeningRepo: Repository<ExamResultListening>;
  public ExamResultReadingRepo: Repository<ExamResultReading>;
  public ExamResultWritingRepo: Repository<ExamResultWriting>;
  public ExamResultSpeakingRepo: Repository<ExamResultSpeaking>;
  public OrganizationRepo: Repository<Organization>;
  public ScheduleRepo: Repository<ExamSchedule>;
  public FeedbackRepo: Repository<Feedback>;
  public ExaminerIntroductionRepo: Repository<ExaminerIntroduction>;
  public PlanRepo: Repository<Plan>;
  public PlanDetailRepo: Repository<PlanDetail>;
  public PlanAttributeRepo: Repository<PlanAttribute>;
  public PlanTypeRepo: Repository<PlanType>;
  public EvaluateRepo: Repository<Evaluate>;
  public GradeFeedbackRepo: Repository<GradeFeedback>; // Assuming you have a GradeFeedback entity
  public RegisterGradeExamRepo: Repository<RegisterGradeExam>;
  constructor() {
    this._dataSource = dataSource;
    this.FunctionRepo = this._dataSource.getRepository(Function);
    this.GroupRoleRepo = this._dataSource.getRepository(GroupRole);
    this.PermissionRepo = this._dataSource.getRepository(Permission);
    this.UserRepo = this._dataSource.getRepository(User);
    this.SkillRepo = this._dataSource.getRepository(Skill);
    this.LevelRepo = this._dataSource.getRepository(Level);
    this.CategoryRepo = this._dataSource.getRepository(Category);
    this.QuestionRepo = this._dataSource.getRepository(Question);
    this.SubQuesionRepo = this._dataSource.getRepository(SubQuestion);
    this.AnswerRepo = this._dataSource.getRepository(Answer);
    this.ExamRepo = this._dataSource.getRepository(Exam);
    this.ExamQuestionRepo = this._dataSource.getRepository(ExamQuestion);
    this.ExamSkillStatusRepo = this._dataSource.getRepository(ExamSkillStatus);
    this.ExamResultListeningRepo = this._dataSource.getRepository(ExamResultListening);
    this.ExamResultReadingRepo = this._dataSource.getRepository(ExamResultReading);
    this.ExamResultWritingRepo = this._dataSource.getRepository(ExamResultWriting);
    this.ExamResultSpeakingRepo = this._dataSource.getRepository(ExamResultSpeaking);
    this.OrganizationRepo = this._dataSource.getRepository(Organization);
    this.ScheduleRepo = this._dataSource.getRepository(ExamSchedule);
    this.FeedbackRepo = this._dataSource.getRepository(Feedback);
    this.ExaminerIntroductionRepo = this._dataSource.getRepository(ExaminerIntroduction);
    this.PlanRepo = this._dataSource.getRepository(Plan);
    this.PlanDetailRepo = this._dataSource.getRepository(PlanDetail);
    this.PlanAttributeRepo = this._dataSource.getRepository(PlanAttribute);
    this.PlanTypeRepo = this._dataSource.getRepository(PlanType);
    this.EvaluateRepo = this._dataSource.getRepository(Evaluate);
    this.GradeFeedbackRepo = this._dataSource.getRepository(GradeFeedback);
    this.RegisterGradeExamRepo = this._dataSource.getRepository(RegisterGradeExam);

    this._dataSource
      .initialize()
      .then(() => {
        console.log(`Database connection established at: ${new Date().toISOString()}`);
        logger.info(`Database connection established with: ${ENV.DB_HOST}:${ENV.DB_PORT} at: ${new Date().toISOString()}`);
      })
      .catch((error) => {
        console.log("Database connection failed: ", error);
        logger.error(`Database connection failed at: ${new Date().toISOString()}: ${error}`);
      });
  }

  public createQueryRunner(): QueryRunner {
    return this._dataSource.createQueryRunner();
  }

  public getDataSource(): DataSource {
    return this._dataSource;
  }
}

export default DatabaseService;
