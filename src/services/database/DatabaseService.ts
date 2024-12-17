import { ENV } from "@/constants/env";
import { Answer } from "@/entity/Answer";
import { Category } from "@/entity/Category";
import { Exam } from "@/entity/Exam";
import { ExamQuestion } from "@/entity/ExamQuestion";
import { ExamResultListening } from "@/entity/ExamResultListening";
import { ExamResultReading } from "@/entity/ExamResultReading";
import { ExamResultSpeaking } from "@/entity/ExamResultSpeaking";
import { ExamResultWriting } from "@/entity/ExamResultWriting";
import { ExamSchedule } from "@/entity/ExamSchedule";
import { ExamSkillStatus } from "@/entity/ExamSkillStatus";
import { GroupRole } from "@/entity/GroupRole";
import { Level } from "@/entity/Level";
import { Organization } from "@/entity/Organization";
import { Permission } from "@/entity/Permission";
import { Question } from "@/entity/Question";
import { Skill } from "@/entity/Skill";
import { SubQuestion } from "@/entity/SubQuestion";
import { User } from "@/entity/User";
import logger from "@/helpers/logger";
import "reflect-metadata";
import { DataSource, QueryRunner, Repository } from "typeorm";

class DatabaseService {
    private _dataSource: DataSource
    public FunctionRepo: Repository<Function>
    public GroupRoleRepo: Repository<GroupRole>
    public PermissionRepo: Repository<Permission>
    public UserRepo: Repository<User>
    public SkillRepo: Repository<Skill>
    public LevelRepo: Repository<Level>
    public CategoryRepo: Repository<Category>
    public QuestionRepo: Repository<Question>
    public SubQuesionRepo: Repository<SubQuestion>
    public AnswerRepo: Repository<Answer>
    public ExamRepo: Repository<Exam>
    public ExamQuestionRepo: Repository<ExamQuestion>
    public ExamSkillStatusRepo: Repository<ExamSkillStatus>
    public ExamResultListeningRepo: Repository<ExamResultListening>
    public ExamResultReadingRepo: Repository<ExamResultReading>
    public ExamResultWritingRepo: Repository<ExamResultWriting>
    public ExamResultSpeakingRepo: Repository<ExamResultSpeaking>
    public OrganizationRepo: Repository<Organization>
    public ScheduleRepo: Repository<ExamSchedule>
    constructor() {
        this._dataSource = new DataSource({
            type: "postgres",
            host: ENV.DB_HOST || "localhost",
            port: Number(ENV.DB_PORT) || 5432,
            username: ENV.DB_USERNAME,
            password: ENV.DB_PASSWORD,
            database: ENV.DB_NAME,
            entities: [__dirname + '/../../**/entity/**/*.{js,ts}'],
            migrations: [__dirname + '/../../**/migration/**/*.{js,ts}'],
            synchronize: true,
            logging: false,
        });
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
    }
    public async createConnection(): Promise<void> {
        try {
            await this._dataSource.initialize();
            console.log(`Database connection established with: ${ENV.DB_HOST}:${ENV.DB_PORT}`);
            logger.info(`Database connection established with: ${ENV.DB_HOST}:${ENV.DB_PORT} at: ${new Date().toISOString()}`);
        }
        catch (error) {
            console.log("Database connection failed");
            console.log(error);
        }
    }
    public createQueryRunner(): QueryRunner {
        return this._dataSource.createQueryRunner();
    }
}

export default DatabaseService;