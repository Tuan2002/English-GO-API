import { ErrorMessages } from "@/constants/ErrorMessages";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import IOrganizationService from "@/interfaces/organization/IOrganizationService";
import { StatusCodes } from "http-status-codes";
import { v4 as uuid } from "uuid";
import DatabaseService from "../database/DatabaseService";
import logger from "@/helpers/logger";
import IFeedbackService from "@/interfaces/feedback/IFeedbackService";
import { ISendFeedbackDTO } from "@/interfaces/feedback/IFeedbackDTO";
import { IPaginationBase, IPaginationResponse } from "@/interfaces/base/IPaginationBase";

export default class FeedbackService implements IFeedbackService {
  private readonly _context: DatabaseService;
  constructor(DatabaseService: DatabaseService) {
    this._context = DatabaseService;
  }

  async sendFeedback(feedback: ISendFeedbackDTO): Promise<IResponseBase> {
    try {
      if (!feedback || !feedback.fullName || !feedback.email || !feedback.feedback) {
        return {
          data: null,
          error: {
            errorDetail: "Thông tin nhập vào không hợp lệ",
            message: "Thông tin nhập vào không hợp lệ",
          },
          message: "Thông tin nhập vào không hợp lệ",
          success: false,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const newFeedback = await this._context.FeedbackRepo.save({
        id: uuid(),
        fullName: feedback.fullName,
        email: feedback.email,
        phoneNumber: feedback.phoneNumber,
        feedback: feedback.feedback,
      });
      return {
        data: newFeedback,
        error: null,
        message: "Phản hồi thành công",
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
  async getAllFeedback(pagination: IPaginationBase): Promise<IResponseBase> {
    try {
      let { page, limit } = pagination;
      if (!page || page < 1) page = 1;
      if (!limit) limit = 10;

      let totalCountQuery = this._context.FeedbackRepo.count({});
      let feedbackQuery = this._context.FeedbackRepo.createQueryBuilder("feedback")
        .orderBy("feedback.createdAt", "DESC")
        .select(["feedback.id", "feedback.fullName", "feedback.email", "feedback.phoneNumber", "feedback.feedback"])
        .skip(Number((page - 1) * limit))
        .take(limit)
        .getMany();
      const [totalItem, feedbacks] = await Promise.all([totalCountQuery, feedbackQuery]);
      const dataResponse: IPaginationResponse = {
        items: feedbacks,
        currentPage: page,
        limit,
        totalItems: totalItem,
        totalPages: Math.ceil(totalItem / limit),
      };
      return {
        data: dataResponse,
        message: "Get list feedbacks successfully",
        success: true,
        status: StatusCodes.OK,
        error: null,
      };
    } catch (error) {
      logger.error(error?.message);
      console.log(`Error in Feedback - method getAllFeedback() at ${new Date().getTime()} with message ${error?.message}`);
      return {
        data: null,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        success: false,
        error: {
          message: error.message,
          errorDetail: error.message,
        },
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
