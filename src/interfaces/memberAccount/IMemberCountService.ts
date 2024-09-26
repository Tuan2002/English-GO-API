import { IResponseBase } from "../base/IResponseBase";

export default interface IMemberCountService {
  getAllMemberCounts(): Promise<IResponseBase>;
}
