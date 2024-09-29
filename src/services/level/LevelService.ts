import { ErrorMessages } from "@/constants/ErrorMessages";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import ILevelService from "@/interfaces/level/ILevelService";
import { Repo } from "@/repository";
import { StatusCodes } from "http-status-codes";

export default class LevelService implements ILevelService {
  constructor() {
    // Constructor
  }

  async getAllLevels(): Promise<IResponseBase> {
    try {
      const levels = await Repo.LevelRepo.find();
      return {
        data: levels,
        errorMessage: "",
        success: true,
        error: null,
        status: StatusCodes.OK,
      };
    } catch (error) {
      return {
        data: null,
        errorMessage: ErrorMessages.INTERNAL_SERVER_ERROR,
        success: false,
        error: {
          message: error.message,
          errorDetail: error.message,
        },
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
  async getLevelById(levelId: string): Promise<IResponseBase> {
    try {
      if (!levelId) {
        return {
          data: null,
          errorMessage: ErrorMessages.INVALID_REQUEST_BODY,
          success: false,
          error: {
            message: ErrorMessages.INVALID_REQUEST_BODY,
            errorDetail: "levelId is required",
          },
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const level = await Repo.LevelRepo.findOne({
        where: {
          id: levelId,
        },
      });
      if (!level) {
        return {
          data: null,
          errorMessage: ErrorMessages.NOT_FOUND,
          success: false,
          error: {
            message: ErrorMessages.NOT_FOUND,
            errorDetail: "Level not found",
          },
          status: StatusCodes.NOT_FOUND,
        };
      }
      return {
        data: level,
        errorMessage: "",
        success: true,
        error: null,
        status: StatusCodes.OK,
      };
    } catch (error) {
      return {
        data: null,
        errorMessage: ErrorMessages.INTERNAL_SERVER_ERROR,
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
