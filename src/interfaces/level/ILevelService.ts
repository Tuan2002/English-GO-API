import { IResponseBase } from "../base/IResponseBase";

export default interface ILevelService {
  getAllLevels(): Promise<IResponseBase>;
  getLevelById(levelId: string): Promise<IResponseBase>;
}
