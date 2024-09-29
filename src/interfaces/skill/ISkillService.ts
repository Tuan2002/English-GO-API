import { IResponseBase } from "../base/IResponseBase";

export default interface ISkillService {
  getAllSkills(): Promise<IResponseBase>;
  getSkillById(skillId: string): Promise<IResponseBase>;
}
