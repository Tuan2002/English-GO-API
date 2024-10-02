import { IResponseBase } from "../base/IResponseBase";
import { ISkillDataUpdate } from "./ISkillDTO";

export default interface ISkillService {
  getAllSkills(): Promise<IResponseBase>;
  getSkillById(skillId: string): Promise<IResponseBase>;
  updateSkill(skillId: string, skillData: ISkillDataUpdate): Promise<IResponseBase>;
}
