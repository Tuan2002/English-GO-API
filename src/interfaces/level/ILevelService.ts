import { IResponseBase } from "../base/IResponseBase";
import { ILevelDataUpdate } from "./ILevelDTO";

export default interface ILevelService {
  getAllLevels(): Promise<IResponseBase>;
  getLevelById(levelId: string): Promise<IResponseBase>;
  getListLevelOfSkillId(skillId: string): Promise<IResponseBase>;
  updateLevel(levelId: string, levelData: ILevelDataUpdate): Promise<IResponseBase>;
}
