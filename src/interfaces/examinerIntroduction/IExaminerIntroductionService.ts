import { IResponseBase } from "../base/IResponseBase";
import { IUpdateExaminerIntroductionDTO } from "./IExaminerIntroductionDTO";

export default interface IExaminerIntroductionService {
  getAllExaminerIntroduction(): Promise<IResponseBase>;
  getExaminerIntroduction(): Promise<IResponseBase>;
  updateExaminerIntroduction(data: IUpdateExaminerIntroductionDTO): Promise<IResponseBase>;
}
