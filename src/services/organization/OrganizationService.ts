import { ErrorMessages } from "@/constants/ErrorMessages";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import IOrganizationService from "@/interfaces/organization/IOrganizationService";
import { StatusCodes } from "http-status-codes";
import { v4 as uuid } from 'uuid';
import DatabaseService from "../database/DatabaseService";

export default class OrganizationService implements IOrganizationService {
  private readonly _context: DatabaseService
  constructor(DatabaseService: DatabaseService) {
    this._context = DatabaseService;
  }

  async getAllOrganization(): Promise<IResponseBase> {
    try {
      const organizations = await this._context.OrganizationRepo.find({
        order: {
          createdAt: "ASC",
        },
      });
      return {
        data: organizations,
        error: null,
        message: "Get all organizations successfully",
        success: true,
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
  async getOrganizationById(organizationId: any): Promise<IResponseBase> {
    try {
      if (!organizationId) {
        return {
          data: null,
          message: "Id is required",
          success: false,
          error: {
            message: "Id is required",
            errorDetail: "Id is required",
          },
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const organization = await this._context.OrganizationRepo.findOne({
        where: {
          id: organizationId,
        },
      });
      if (!organization) {
        return {
          data: null,
          message: "Organization not found",
          success: false,
          error: {
            message: "Organization not found",
            errorDetail: "Organization not found",
          },
          status: StatusCodes.NOT_FOUND,
        };
      }
      return {
        data: organization,
        error: null,
        message: "Get organization by id successfully",
        success: true,
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
  async createOrganization(data: any): Promise<IResponseBase> {
    try {
      if (!data.name) {
        return {
          data: null,
          message: "Name is required",
          success: false,
          error: {
            message: "Name is required",
            errorDetail: "Name is required",
          },
          status: StatusCodes.BAD_REQUEST,
        };
      }
      data.id = uuid();
      const organization = this._context.OrganizationRepo.create(data);
      await this._context.OrganizationRepo.save(organization);
      const createdOrganization = await this._context.OrganizationRepo.findOne({
        where: {
          id: data.id,
        },
      });
      if (!createdOrganization) {
        return {
          data: null,
          message: "Create organization failed",
          success: false,
          error: {
            message: "Create organization failed",
            errorDetail: "Create organization failed",
          },
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        };
      }
      return {
        data: createdOrganization,
        error: null,
        message: "Create organization successfully",
        success: true,
        status: StatusCodes.CREATED,
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
  async updateOrganization(organizationId: any, data: any): Promise<IResponseBase> {
    try {
      if (!organizationId) {
        return {
          data: null,
          message: "Id is required",
          success: false,
          error: {
            message: "Id is required",
            errorDetail: "Id is required",
          },
          status: StatusCodes.BAD_REQUEST,
        };
      }
      if (!data.name) {
        return {
          data: null,
          message: "Name is required",
          success: false,
          error: {
            message: "Name is required",
            errorDetail: "Name is required",
          },
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const organization = await this._context.OrganizationRepo.findOne({
        where: {
          id: organizationId,
        },
      });
      if (!organization) {
        return {
          data: null,
          message: "Organization not found",
          success: false,
          error: {
            message: "Organization not found",
            errorDetail: "Organization not found",
          },
          status: StatusCodes.NOT_FOUND,
        };
      }
      organization.name = data.name;
      organization.description = data.description;
      const organizationUpdated = await this._context.OrganizationRepo.save(organization);
      if (!organizationUpdated) {
        return {
          data: null,
          message: "Update organization failed",
          success: false,
          error: {
            message: "Update organization failed",
            errorDetail: "Update organization failed",
          },
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        };
      }
      return {
        data: organizationUpdated,
        error: null,
        message: "Update organization successfully",
        success: true,
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
  async deleteOrganization(organizationId: any): Promise<IResponseBase> {
    try {
      if (!organizationId) {
        return {
          data: null,
          message: "Id is required",
          success: false,
          error: {
            message: "Id is required",
            errorDetail: "Id is required",
          },
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const organization = await this._context.OrganizationRepo.findOne({
        where: {
          id: organizationId,
        },
      });
      if (!organization) {
        return {
          data: null,
          message: "Organization not found",
          success: false,
          error: {
            message: "Organization not found",
            errorDetail: "Organization not found",
          },
          status: StatusCodes.NOT_FOUND,
        };
      }
      const organizationDeleted = await this._context.OrganizationRepo.remove(organization);
      if (!organizationDeleted) {
        return {
          data: null,
          message: "Delete organization failed",
          success: false,
          error: {
            message: "Delete organization failed",
            errorDetail: "Delete organization failed",
          },
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        };
      }
      return {
        data: {
          id: organizationId,
        },
        error: null,
        message: "Delete organization successfully",
        success: true,
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
