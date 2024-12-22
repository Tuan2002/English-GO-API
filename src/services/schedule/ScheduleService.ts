import { ExamSchedule } from "@/entity/ExamSchedule";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import { IScheduleService } from "@/interfaces/schedule/IScheduleService";
import { v4 as uuid } from "uuid";
import DatabaseService from "../database/DatabaseService";
import logger from "@/helpers/logger";

export class ScheduleService implements IScheduleService {
  private readonly _context: DatabaseService;
  constructor(DatabaseService: DatabaseService) {
    this._context = DatabaseService;
  }
  async getAllSchedule(): Promise<IResponseBase> {
    try {
      const schedules = await this._context.ScheduleRepo.find({
        order: {
          startDate: "ASC",
        },
      });
      return {
        data: schedules,
        error: null,
        message: "Get all schedules successfully",
        success: true,
        status: 200,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        data: null,
        message: "Internal server error",
        success: false,
        error: {
          message: error.message,
          errorDetail: error.message,
        },
        status: 500,
      };
    }
  }
  async getScheduleById(scheduleId: any): Promise<IResponseBase> {
    try {
      if (!scheduleId) {
        return {
          data: null,
          message: "Id is required",
          success: false,
          error: {
            message: "Id is required",
            errorDetail: "Id is required",
          },
          status: 400,
        };
      }
      const schedule = await this._context.ScheduleRepo.findOne({
        where: {
          id: scheduleId,
        },
      });
      if (!schedule) {
        return {
          data: null,
          message: "Schedule not found",
          success: false,
          error: {
            message: "Schedule not found",
            errorDetail: "Schedule not found",
          },
          status: 404,
        };
      }
      return {
        data: schedule,
        error: null,
        message: "Get schedule by id successfully",
        success: true,
        status: 200,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        data: null,
        message: "Internal server error",
        success: false,
        error: {
          message: error.message,
          errorDetail: error.message,
        },
        status: 500,
      };
    }
  }
  async createSchedule(data: any): Promise<IResponseBase> {
    try {
      if (!data || !data.examPeriod || !data.startDate || !data.endDate) {
        return {
          data: null,
          message: "examPeriod, startDate, endDate and organizationId is required",
          success: false,
          error: {
            message: "examPeriod, startDate, endDate and organizationId is required",
            errorDetail: "examPeriod, startDate, endDate and organizationId is required",
          },
          status: 400,
        };
      }
      const organization = await this._context.OrganizationRepo.findOne({
        where: {
          id: data.organizationId,
        },
      });
      if (!data.organizationId || !organization || !organization.id) {
        return {
          data: null,
          message: "Organization not found",
          success: false,
          error: {
            message: "Organization not found",
            errorDetail: "Organization not found",
          },
          status: 404,
        };
      }
      const scheduleData = new ExamSchedule();
      scheduleData.id = uuid();
      scheduleData.examPeriod = data.examPeriod;
      scheduleData.startDate = data.startDate;
      scheduleData.endDate = data.endDate;
      scheduleData.organizationId = data.organizationId;
      scheduleData.description = data.description;

      const schedule = this._context.ScheduleRepo.create(scheduleData);
      await this._context.ScheduleRepo.save(schedule);
      const scheduleCreated = await this._context.ScheduleRepo.findOne({
        where: {
          id: scheduleData.id,
        },
      });
      if (!scheduleCreated) {
        return {
          data: null,
          message: "Create schedule failed",
          success: false,
          error: {
            message: "Create schedule failed",
            errorDetail: "Create schedule failed",
          },
          status: 500,
        };
      }
      return {
        data: scheduleCreated,
        error: null,
        message: "Create schedule successfully",
        success: true,
        status: 201,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        data: null,
        message: "Internal server error",
        success: false,
        error: {
          message: error.message,
          errorDetail: error.message,
        },
        status: 500,
      };
    }
  }
  async updateSchedule(scheduleId: any, data: any): Promise<IResponseBase> {
    try {
      if (!scheduleId) {
        return {
          data: null,
          message: "Id is required",
          success: false,
          error: {
            message: "Id is required",
            errorDetail: "Id is required",
          },
          status: 400,
        };
      }
      if (!data.examPeriod || !data.startDate || !data.endDate) {
        return {
          data: null,
          message: "examPeriod, startDate, endDate and organizationId is required",
          success: false,
          error: {
            message: "examPeriod, startDate, endDate and organizationId is required",
            errorDetail: "examPeriod, startDate, endDate and organizationId is required",
          },
          status: 400,
        };
      }
      const organization = await this._context.OrganizationRepo.findOne({
        where: {
          id: data.organizationId,
        },
      });
      if (!data.organizationId || !organization || !organization.id) {
        return {
          data: null,
          message: "Organization not found",
          success: false,
          error: {
            message: "Organization not found",
            errorDetail: "Organization not found",
          },
          status: 404,
        };
      }
      const schedule = await this._context.ScheduleRepo.findOne({
        where: {
          id: scheduleId,
        },
      });
      if (!schedule) {
        return {
          data: null,
          message: "Schedule not found",
          success: false,
          error: {
            message: "Schedule not found",
            errorDetail: "Schedule not found",
          },
          status: 404,
        };
      }
      schedule.examPeriod = data.examPeriod;
      schedule.startDate = data.startDate;
      schedule.endDate = data.endDate;
      schedule.organizationId = data.organizationId;
      schedule.description = data.description;
      await this._context.ScheduleRepo.save(schedule);
      const scheduleUpdated = await this._context.ScheduleRepo.findOne({
        where: {
          id: scheduleId,
        },
      });
      if (!scheduleUpdated) {
        return {
          data: null,
          message: "Update schedule failed",
          success: false,
          error: {
            message: "Update schedule failed",
            errorDetail: "Update schedule failed",
          },
          status: 500,
        };
      }
      return {
        data: scheduleUpdated,
        error: null,
        message: "Update schedule successfully",
        success: true,
        status: 200,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        data: null,
        message: "Internal server error",
        success: false,
        error: {
          message: error.message,
          errorDetail: error.message,
        },
        status: 500,
      };
    }
  }
  async deleteSchedule(scheduleId: any): Promise<IResponseBase> {
    try {
      if (!scheduleId) {
        return {
          data: null,
          message: "Id is required",
          success: false,
          error: {
            message: "Id is required",
            errorDetail: "Id is required",
          },
          status: 400,
        };
      }
      const schedule = await this._context.ScheduleRepo.findOne({
        where: {
          id: scheduleId,
        },
      });
      if (!schedule) {
        return {
          data: null,
          message: "Schedule not found",
          success: false,
          error: {
            message: "Schedule not found",
            errorDetail: "Schedule not found",
          },
          status: 404,
        };
      }
      await this._context.ScheduleRepo.delete({
        id: scheduleId,
      });
      return {
        data: {
          id: scheduleId,
        },
        message: "Delete schedule successfully",
        success: true,
        error: null,
        status: 200,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        data: null,
        message: "Internal server error",
        success: false,
        error: {
          message: error.message,
          errorDetail: error.message,
        },
        status: 500,
      };
    }
  }
}
