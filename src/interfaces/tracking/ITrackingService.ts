import { IResponseBase } from "../base/IResponseBase";
import { IExamTrackingRequest } from "./ITrackingDTO";

export interface ITrackingService {
    getExamSessions(): Promise<IResponseBase>;
    getExamResults(trackingDto: IExamTrackingRequest): Promise<IResponseBase>;
}