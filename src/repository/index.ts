import AppDataSource from "@/data-source";
import { Activity } from "@/entity/Activity";
import { Award } from "@/entity/Award";
import { Company } from "@/entity/Company";
import { CvCreated } from "@/entity/CvCreated";
import { CvUpload } from "@/entity/CvUpload";
import { Education } from "@/entity/Education";
import { Experience } from "@/entity/Experience";
import { Function } from "@/entity/Function";
import { GroupRole } from "@/entity/GroupRole";
import { MemberCount } from "@/entity/MemberCount";
import { Permission } from "@/entity/Permission";
import { Position } from "@/entity/Position";
import { Product } from "@/entity/Product";
import { Profession } from "@/entity/Profession";
import { Profile } from "@/entity/Profile";
import { Province } from "@/entity/Province";
import { Skill } from "@/entity/Skill";
import { SkillLevel } from "@/entity/SkillLevel";
import { User } from "@/entity/User";
import { Certificate } from "crypto";

const ActivityRepo = AppDataSource.getRepository(Activity);
const AwardRepo = AppDataSource.getRepository(Award);
const CertificateRepo = AppDataSource.getRepository(Certificate);
const CvCreateRepo = AppDataSource.getRepository(CvCreated);
const CvUploadRepo = AppDataSource.getRepository(CvUpload);
const EducationRepo = AppDataSource.getRepository(Education);
const ExperienceRepo = AppDataSource.getRepository(Experience);
const FunctionRepo = AppDataSource.getRepository(Function);
const GroupRoleRepo = AppDataSource.getRepository(GroupRole);
const PermissionRepo = AppDataSource.getRepository(Permission);
const ProductRepo = AppDataSource.getRepository(Product);
const PositionRepo = AppDataSource.getRepository(Position);
const ProfessionRepo = AppDataSource.getRepository(Profession);
const ProfileRepo = AppDataSource.getRepository(Profile);
const SkillRepo = AppDataSource.getRepository(Skill);
const SkillLevelRepo = AppDataSource.getRepository(SkillLevel);
const UserRepo = AppDataSource.getRepository(User);
const ProvinceRepo = AppDataSource.getRepository(Province);
const MemberCountRepo = AppDataSource.getRepository(MemberCount);
const CompanyRepo = AppDataSource.getRepository(Company);

export const Repo = {
  ActivityRepo,
  AwardRepo,
  CertificateRepo,
  CvCreateRepo,
  CvUploadRepo,
  EducationRepo,
  ExperienceRepo,
  FunctionRepo,
  GroupRoleRepo,
  PermissionRepo,
  ProductRepo,
  PositionRepo,
  ProfessionRepo,
  ProfileRepo,
  SkillRepo,
  SkillLevelRepo,
  UserRepo,
  ProvinceRepo,
  MemberCountRepo,
  CompanyRepo,
};
