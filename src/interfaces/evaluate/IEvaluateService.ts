import { IPaginationBase } from "../base/IPaginationBase";
import { IResponseBase } from "../base/IResponseBase";
import { ISendEvaluateDTO } from "./IEvaluateDTO";

export default interface IEvaluateService {
  sendEvaluate(evaluate: ISendEvaluateDTO): Promise<IResponseBase>;
  getEvaluates(pagination: IPaginationBase): Promise<IResponseBase>;
  toogleShowEvaluate(evaluateId: string): Promise<IResponseBase>;
}
