import { IResponseBase } from "../base/IResponseBase";
import { IRegisterCompanyDTO } from "./ICompanyDTO";

export default interface ICompanyService {
  getAllCompany(page: number, limit: number, search: string): Promise<IResponseBase>;
  getCompanyById(companyId: string): Promise<IResponseBase>;
  getCompanyByUserId(userId: string): Promise<IResponseBase>;
  registerCompanyByRecruitment(data: IRegisterCompanyDTO): Promise<IResponseBase>;
  updateCompanyWhenRegister(data: IRegisterCompanyDTO): Promise<IResponseBase>;
  approveRegisterCompany(companyId: string): Promise<IResponseBase>;
  rejectRegisterCompany(companyId: string, reason: string): Promise<IResponseBase>;
}
