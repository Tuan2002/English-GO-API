import { IResponseBase } from "../base/IResponseBase";
import { IUpdateExaminerIntroductionDTO } from "./IExaminerIntroductionDTO";

export default interface IExaminerIntroductionService {
  getExaminerIntroduction(): Promise<IResponseBase>;
  updateExaminerIntroduction(data: IUpdateExaminerIntroductionDTO): Promise<IResponseBase>;
}
