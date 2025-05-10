import EGroupRole from "@/constants/GroupRole";
import { LocalStorage } from "@/constants/LocalStorage";
import { ExaminerIntroduction } from "@/entity/ExaminerIntroduction";
import logger from "@/helpers/logger";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import { IUpdateExaminerIntroductionDTO } from "@/interfaces/examinerIntroduction/IExaminerIntroductionDTO";
import IExaminerIntroductionService from "@/interfaces/examinerIntroduction/IExaminerIntroductionService";
import { RequestStorage } from "@/middlewares";
import { StatusCodes } from "http-status-codes";
import DatabaseService from "../database/DatabaseService";

export default class ExaminerIntroductionService implements IExaminerIntroductionService {
  private readonly _context: DatabaseService;
  constructor(DatabaseService: DatabaseService) {
    this._context = DatabaseService;
  }
  async getAllExaminerIntroduction(): Promise<IResponseBase> {
    try {
      const userWithExaminerIntroduction = await this._context.UserRepo.createQueryBuilder("user")
        .leftJoinAndSelect("user.examinerIntroduction", "examinerIntroduction")
        .where("user.groupRoleId = :groupRoleId", { groupRoleId: EGroupRole.EXAMINER })
        .select([
          "user.id",
          "user.email",
          "user.username",
          "user.fullName",
          "user.phoneNumber",
          "user.birthday",
          "user.gender",
          "user.avatar",
          "examinerIntroduction.banner",
          "examinerIntroduction.description",
          "examinerIntroduction.introduction",
          "examinerIntroduction.workPlace",
          "examinerIntroduction.workAddress",
        ])
        .getMany();
      return {
        data: userWithExaminerIntroduction,
        error: null,
        message: "Lấy danh sách giáo viên thành công",
        success: true,
        status: StatusCodes.OK,
      };
    } catch (error) {
      logger.error(error.message);
      console.log(
        `Error in Examiner Introduction - method getAllExaminerIntroduction() at ${new Date().getTime()} with message ${
          error.message
        }`
      );
      return {
        data: null,
        error: null,
        message: "Hệ thống đang gặp sự cố, vui lòng thử lại sau",
        success: true,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
  async getExaminerIntroduction(): Promise<IResponseBase> {
    try {
      const request = RequestStorage.getStore()?.get(LocalStorage.REQUEST_STORE);
      const userId = request?.user.id;
      if (!userId) {
        return {
          data: null,
          error: null,
          message: "Không tìm thấy thông tin giáo viên",
          success: false,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const examinerIntroduction = await this._context.ExaminerIntroductionRepo.findOne({
        where: { userId: userId },
      });
      if (!examinerIntroduction) {
        return {
          data: null,
          error: null,
          message: "Không tìm thấy thông tin giáo viên",
          success: false,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      return {
        data: examinerIntroduction,
        error: null,
        message: "Lấy thông tin giáo viên thành công",
        success: true,
        status: StatusCodes.OK,
      };
    } catch (error) {
      logger.error(error.message);
      console.log(
        `Error in Examiner Introduction - method getExaminerIntroduction() at ${new Date().getTime()} with message ${
          error.message
        }`
      );
      return {
        data: null,
        error: null,
        message: "Hệ thống đang gặp sự cố, vui lòng thử lại sau",
        success: true,
        status: StatusCodes.BAD_REQUEST,
      };
    }
  }
  async updateExaminerIntroduction(dataUpdata: IUpdateExaminerIntroductionDTO): Promise<IResponseBase> {
    try {
      if (!dataUpdata) {
        return {
          data: null,
          error: null,
          message: "Dữ liệu không hợp lệ",
          success: false,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      console.log("dataUpdata", dataUpdata);
      if (!dataUpdata.userId) {
        return {
          data: null,
          error: null,
          message: "Không tìm thấy thông tin giáo viên",
          success: false,
          status: StatusCodes.BAD_REQUEST,
        };
      }

      const examinerIntroduction = await this._context.ExaminerIntroductionRepo.findOne({
        where: { userId: dataUpdata.userId },
      });
      const examiner = new ExaminerIntroduction();
      examiner.id = dataUpdata.userId;
      examiner.userId = dataUpdata.userId;
      examiner.description = dataUpdata.description;
      examiner.introduction = dataUpdata.introduction;
      examiner.workPlace = dataUpdata.workPlace;
      examiner.workAddress = dataUpdata.workAddress;
      examiner.banner = dataUpdata.banner;

      if (!examinerIntroduction) {
        this._context.ExaminerIntroductionRepo.create(examiner);
      } else {
        this._context.ExaminerIntroductionRepo.update(examiner.id, examiner);
      }
      await this._context.ExaminerIntroductionRepo.save(examiner);
      return {
        data: examiner,
        error: null,
        message: "Cập nhật thông tin giáo viên thành công",
        success: true,
        status: StatusCodes.OK,
      };
    } catch (error) {
      logger.error(error.message);
      console.log(
        `Error in Examiner Introduction - method updateExaminerIntroduction() at ${new Date().getTime()} with message ${
          error.message
        }`
      );
      return {
        data: null,
        error: null,
        message: "Hệ thống đang gặp sự cố, vui lòng thử lại sau",
        success: true,
        status: StatusCodes.BAD_REQUEST,
      };
    }
  }
}
