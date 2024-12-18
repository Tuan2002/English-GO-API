import { ErrorMessages } from "@/constants/ErrorMessages";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import { ISkillDataUpdate } from "@/interfaces/skill/ISkillDTO";
import ISkillService from "@/interfaces/skill/ISkillService";
import { StatusCodes } from "http-status-codes";
import DatabaseService from "../database/DatabaseService";

export default class SkillService implements ISkillService {
  private readonly _context: DatabaseService
  constructor(DatabaseService: DatabaseService) {
    this._context = DatabaseService;
  }
  async getAllSkills(): Promise<IResponseBase> {
    try {
      const skills = await this._context.SkillRepo.find({
        order: {
          order: "ASC",
        },
      });
      return {
        data: skills,
        message: "",
        success: true,
        error: null,
        status: StatusCodes.OK,
      };
    } catch (error) {
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
  async getSkillById(skillId: string): Promise<IResponseBase> {
    try {
      if (!skillId) {
        return {
          data: null,
          message: ErrorMessages.INVALID_REQUEST_BODY,
          success: false,
          error: {
            message: ErrorMessages.INVALID_REQUEST_BODY,
            errorDetail: "SkillId is required",
          },
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const skill = await this._context.SkillRepo.findOne({
        where: {
          id: skillId,
        },
      });
      if (!skill) {
        return {
          data: null,
          message: ErrorMessages.NOT_FOUND,
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
        message: "",
        success: true,
        error: null,
        status: StatusCodes.OK,
      };
    } catch (error) {
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
  async updateSkill(skillId: string, skillData: ISkillDataUpdate): Promise<IResponseBase> {
    try {
      if (!skillId || !skillData) {
        return {
          data: null,
          message: ErrorMessages.INVALID_REQUEST_BODY,
          success: false,
          error: {
            message: ErrorMessages.INVALID_REQUEST_BODY,
            errorDetail: "SkillId and SkillData are required",
          },
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const skill = await this._context.SkillRepo.findOne({
        where: {
          id: skillId,
        },
      });
      if (!skill) {
        return {
          data: null,
          message: ErrorMessages.NOT_FOUND,
          success: false,
          error: {
            message: ErrorMessages.NOT_FOUND,
            errorDetail: "Skill not found",
          },
          status: StatusCodes.NOT_FOUND,
        };
      }
      skill.image = skillData.image;
      skill.description = skillData.description;
      await this._context.SkillRepo.save(skill);
      return {
        data: skill,
        message: "",
        success: true,
        error: null,
        status: StatusCodes.OK,
      };
    } catch (error) {
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
