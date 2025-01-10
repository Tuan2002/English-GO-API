import { IPaginationBase } from "../base/IPaginationBase";
import { IResponseBase } from "../base/IResponseBase";
import { ISendFeedbackDTO } from "./IFeedbackDTO";

export default interface IFeedbackService {
  sendFeedback(feedback: ISendFeedbackDTO): Promise<IResponseBase>;
  getAllFeedback(pagination: IPaginationBase): Promise<IResponseBase>;
}
