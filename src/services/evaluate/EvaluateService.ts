import { LocalStorage } from "@/constants/LocalStorage";
import logger from "@/helpers/logger";
import { IPaginationBase, IPaginationResponse } from "@/interfaces/base/IPaginationBase";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import { ISendEvaluateDTO } from "@/interfaces/evaluate/IEvaluateDTO";
import IEvaluateService from "@/interfaces/evaluate/IEvaluateService";
import { RequestStorage } from "@/middlewares";
import { StatusCodes } from "http-status-codes";
import { v4 as uuid } from "uuid";
import DatabaseService from "../database/DatabaseService";

export default class EvaluateService implements IEvaluateService {
  private readonly _context: DatabaseService;
  constructor(DatabaseService: DatabaseService) {
    this._context = DatabaseService;
  }

  async sendEvaluate(evaluate: ISendEvaluateDTO): Promise<IResponseBase> {
    try {
      const request = RequestStorage.getStore()?.get(LocalStorage.REQUEST_STORE);
      const userId = request?.user.id;
      if (!userId) {
        return {
          data: null,
          error: {
            errorDetail: "Vui lòng đăng nhập trước khi đánh giá",
            message: "Vui lòng đăng nhập trước khi đánh giá",
          },
          message: "Vui lòng đăng nhập trước khi đánh giá",
          success: false,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      if (!evaluate.starNumber || evaluate.starNumber < 1 || evaluate.starNumber > 5) {
        return {
          data: null,
          error: {
            errorDetail: "Số sao đánh giá không hợp lệ",
            message: "Số sao đánh giá không hợp lệ",
          },
          message: "Số sao đánh giá không hợp lệ",
          success: false,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      if (!evaluate.description) {
        return {
          data: null,
          error: {
            errorDetail: "Nội dung đánh giá không được để trống",
            message: "Nội dung đánh giá không được để trống",
          },
          message: "Nội dung đánh giá không được để trống",
          success: false,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const newEvaluate = {
        id: uuid(),
        userId: userId,
        starNumber: evaluate.starNumber,
        description: evaluate.description,
        isShow: false,
      };
      const createdEvaluate = await this._context.EvaluateRepo.save(newEvaluate);
      return {
        data: createdEvaluate,
        error: null,
        message: "Đánh giá của bạn đã được gửi thành công",
        success: true,
        status: StatusCodes.OK,
      };
    } catch (error) {
      logger.error(error.message);
      console.log(`Error in Feedback - method sendFeedback() at ${new Date().getTime()} with message ${error.message}`);
      return {
        data: null,
        error: null,
        message: "Hệ thống đang gặp sự cố, vui lòng thử lại sau",
        success: true,
        status: StatusCodes.OK,
      };
    }
  }

  async getEvaluateById(evaluateId: string): Promise<IResponseBase> {
    try {
      if (!evaluateId) {
        return {
          data: null,
          error: {
            errorDetail: "Không tìm thấy mã đánh giá",
            message: "Không tìm thấy mã đánh giá",
          },
          message: "Không tìm thấy mã đánh giá",
          success: false,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const evaluate = await this._context.EvaluateRepo.createQueryBuilder("evaluate")
        .leftJoinAndSelect("evaluate.user", "user")
        .where("evaluate.id = :id", { id: evaluateId })
        .orderBy("evaluate.createdAt", "DESC")
        .select(["evaluate", "user.id", "user.username", "user.fullName", "user.avatar", "user.email"])
        .getOne();
      console.log("evaluate", evaluate);
      if (!evaluate) {
        return {
          data: null,
          error: {
            errorDetail: "Không tìm thấy đánh giá",
            message: "Không tìm thấy đánh giá",
          },
          message: "Không tìm thấy đánh giá",
          success: false,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      return {
        data: evaluate,
        error: null,
        message: "Lấy thông tin đánh giá thành công",
        success: true,
        status: StatusCodes.OK,
      };
    } catch (error) {
      logger.error(error.message);
      console.log(`Error in Feedback - method getFeedbackById() at ${new Date().getTime()} with message ${error.message}`);
      return {
        data: null,
        error: null,
        message: "Hệ thống đang gặp sự cố, vui lòng thử lại sau",
        success: true,
        status: StatusCodes.OK,
      };
    }
  }

  async getEvaluates(pagination: IPaginationBase): Promise<IResponseBase> {
    try {
      let { page, limit, search } = pagination;
      let isShow = search?.isShow;
      if (!page || page < 1) page = 1;
      if (!limit || limit < 5) limit = 5;

      if (typeof isShow === "string") {
        if (isShow === "true") isShow = true;
        else if (isShow === "false") isShow = false;
        else isShow = undefined;
      }

      let totalCountQuery = this._context.EvaluateRepo.count();

      let evaluateQuery = this._context.EvaluateRepo.createQueryBuilder("evaluate")
        .leftJoinAndSelect("evaluate.user", "user")
        .orderBy("evaluate.createdAt", "DESC")
        .select(["evaluate", "user.id", "user.username", "user.fullName", "user.avatar", "user.email"])
        .skip(Number((page - 1) * limit))
        .take(limit)
        .getMany();

      if (isShow !== undefined && isShow !== null) {
        totalCountQuery = this._context.EvaluateRepo.count({
          where: {
            isShow: isShow as boolean,
          },
        });

        evaluateQuery = this._context.EvaluateRepo.createQueryBuilder("evaluate")
          .leftJoinAndSelect("evaluate.user", "user")
          .andWhere("evaluate.isShow = :isShow", { isShow: isShow as boolean })
          .orderBy("evaluate.createdAt", "DESC")
          .skip(Number((page - 1) * limit))
          .take(limit)
          .getMany();
      }

      const [totalItem, evaluates] = await Promise.all([totalCountQuery, evaluateQuery]);

      const dataResponse: IPaginationResponse = {
        items: evaluates,
        currentPage: page,
        limit,
        totalItems: totalItem,
        totalPages: Math.ceil(totalItem / limit),
      };
      console.log("isShow", isShow);
      return {
        data: dataResponse,
        message: "Get list evaluates successfully",
        success: true,
        status: StatusCodes.OK,
        error: null,
      };
    } catch (error) {
      logger.error(error.message);
      console.log(`Error in Feedback - method getFeedbacks() at ${new Date().getTime()} with message ${error.message}`);
      return {
        data: null,
        error: null,
        message: "Hệ thống đang gặp sự cố, vui lòng thử lại sau",
        success: true,
        status: StatusCodes.OK,
      };
    }
  }

  async toogleShowEvaluate(evaluateId: string): Promise<IResponseBase> {
    try {
      if (!evaluateId) {
        return {
          data: null,
          error: {
            errorDetail: "Không tìm thấy mã đánh giá",
            message: "Không tìm thấy mã đánh giá",
          },
          message: "Không tìm thấy mã đánh giá",
          success: false,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const evaluate = await this._context.EvaluateRepo.findOne({
        where: {
          id: evaluateId,
        },
      });
      if (!evaluate) {
        return {
          data: null,
          error: {
            errorDetail: "Không tìm thấy đánh giá",
            message: "Không tìm thấy đánh giá",
          },
          message: "Không tìm thấy đánh giá",
          success: false,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      evaluate.isShow = !evaluate.isShow;
      await this._context.EvaluateRepo.save(evaluate);
      const evaluateUpdated = await this.getEvaluateById(evaluateId);
      if (!evaluateUpdated.success) return evaluateUpdated;
      evaluateUpdated.message = evaluate.isShow ? "Hiển thị đánh giá thành công" : "Ẩn đánh giá thành công";
      return evaluateUpdated;
    } catch (error) {
      logger.error(error.message);
      console.log(`Error in Feedback - method toogleFeedback() at ${new Date().getTime()} with message ${error.message}`);
      return {
        data: null,
        error: null,
        message: "Hệ thống đang gặp sự cố, vui lòng thử lại sau",
        success: true,
        status: StatusCodes.OK,
      };
    }
  }
}
