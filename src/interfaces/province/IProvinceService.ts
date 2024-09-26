import { IResponseBase } from "../base/IResponseBase";

export default interface IProvinceService {
  getProvincies(): Promise<IResponseBase>;
}
