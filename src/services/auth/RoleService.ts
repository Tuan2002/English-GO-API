import IRoleService from "@/interfaces/auth/IRoleService";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import { StatusCodes } from "http-status-codes";
import DatabaseService from "../database/DatabaseService";
import logger from "@/helpers/logger";

export default class RoleService implements IRoleService {
  private readonly _context: DatabaseService;
  constructor(DatabaseService: DatabaseService) {
    this._context = DatabaseService;
  }
  async getUserRoles(groupRoleId: string): Promise<IResponseBase> {
    try {
      const userRoles = await this._context.GroupRoleRepo.find({
        where: {
          id: groupRoleId,
        },
      });
      if (!userRoles) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          message: "User roles not found",
          data: null,
          error: {
            message: "Not Found",
            errorDetail: "User roles not found",
          },
        };
      }
      return {
        status: StatusCodes.OK,
        success: true,
        data: userRoles,
        error: null,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Internal Server Error",
        data: null,
        error: {
          message: "Internal Server Error",
          errorDetail: "Internal Server Error",
        },
      };
    }
  }

  async getGroupRole(groupRoleId: string): Promise<IResponseBase> {
    try {
      const groupRole = await this._context.GroupRoleRepo.findOne({
        where: {
          id: groupRoleId,
        },
      });
      if (!groupRole) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          message: "Group role not found",
          data: null,
          error: {
            message: "Not Found",
            errorDetail: "Group role not found",
          },
        };
      }
      return {
        status: StatusCodes.OK,
        success: true,
        data: groupRole,
        error: null,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Internal Server Error",
        data: null,
        error: {
          message: "Internal Server Error",
          errorDetail: "Internal Server Error",
        },
      };
    }
  }

  async getCurrentUserPermission(roleId: string): Promise<IResponseBase> {
    try {
      const userPerMissions = await this._context.FunctionRepo.createQueryBuilder("function")
        .innerJoin("function.permissions", "permission")
        .where("permission.groupRoleId = :roleId", { roleId })
        .andWhere("permission.isDeleted = :isDeleted", { isDeleted: false })
        .andWhere("permission.isActive = :isActive", { isActive: true })
        .andWhere("function.isActive = :isActive", { isActive: true })
        .andWhere("function.isDeleted = :isDeleted", { isDeleted: false })
        .select(["function.id", "function.name", "function.functionLink"])
        .getMany();

      return {
        status: StatusCodes.OK,
        success: true,
        data: userPerMissions,
        error: null,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Internal Server Error",
        data: null,
        error: {
          message: "Internal Server Error",
          errorDetail: "Internal Server Error",
        },
      };
    }
  }

  async getAllGroupRoles(): Promise<IResponseBase> {
    try {
      const groupRoles = await this._context.GroupRoleRepo.find({
        where: {
          isDeleted: false,
        },
      });
      return {
        status: StatusCodes.OK,
        success: true,
        data: groupRoles,
        error: null,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Internal Server Error",
        data: null,
        error: {
          message: "Internal Server Error",
          errorDetail: error.message,
        },
      };
    }
  }
}
