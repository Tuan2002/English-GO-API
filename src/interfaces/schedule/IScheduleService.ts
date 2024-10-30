import { IResponseBase } from "../base/IResponseBase";

export interface IScheduleService {
  getAllSchedule(): Promise<IResponseBase>;
  getScheduleById(scheduleId: any): Promise<IResponseBase>;
  createSchedule(data: any): Promise<IResponseBase>;
  updateSchedule(scheduleId: any, data: any): Promise<IResponseBase>;
  deleteSchedule(scheduleId: any): Promise<IResponseBase>;
}
