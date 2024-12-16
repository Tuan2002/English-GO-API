import { IResponseBase } from "../base/IResponseBase";

export interface ISetupService {
  setupService(): Promise<IResponseBase>;
}
