import { ErrorMessages } from "@/constants/ErrorMessages";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import ISkillService from "@/interfaces/skill/ISkillService";
import { Repo } from "@/repository";
import { StatusCodes } from "http-status-codes";

export default class SkillService implements ISkillService {
  constructor() {
    // Constructor
  }

  async getAllSkills(): Promise<IResponseBase> {
    try {
      const skills = await Repo.SkillRepo.find();
      return {
        data: skills,
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
  async getSkillById(skillId: string): Promise<IResponseBase> {
    try {
      if (!skillId) {
        return {
          data: null,
          errorMessage: ErrorMessages.INVALID_REQUEST_BODY,
          success: false,
          error: {
            message: ErrorMessages.INVALID_REQUEST_BODY,
            errorDetail: "SkillId is required",
          },
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const skill = await Repo.SkillRepo.findOne({
        where: {
          id: skillId,
        },
      });
      if (!skill) {
        return {
          data: null,
          errorMessage: ErrorMessages.NOT_FOUND,
          success: false,
          error: {
            message: ErrorMessages.NOT_FOUND,
            errorDetail: "Skill not found",
          },
          status: StatusCodes.NOT_FOUND,
        };
      }
      return {
        data: skill,
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
