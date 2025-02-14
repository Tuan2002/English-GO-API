import logger from "@/helpers/logger";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import {
  IAddNewPlanAttributeDTO,
  ICreateNewPlanTypeDTO,
  IUpdatePlanAttributeDTO,
  IUpdatePlanTypeDTO,
} from "@/interfaces/plan/IPlanDTO";
import IPlanService from "@/interfaces/plan/IPlanService";
import { StatusCodes } from "http-status-codes";
import { IsNull } from "typeorm";
import { v4 as uuid } from "uuid";
import DatabaseService from "../database/DatabaseService";

export default class PlanService implements IPlanService {
  private readonly _context: DatabaseService;
  constructor(DatabaseService: DatabaseService) {
    this._context = DatabaseService;
  }
  async getAllPlanTypes(): Promise<IResponseBase> {
    try {
      const planTypes = await this._context.PlanTypeRepo.find();
      return {
        data: planTypes,
        error: null,
        message: "Lấy danh sách loại dịch vụ thành công",
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
        status: StatusCodes.BAD_REQUEST,
      };
    }
  }

  async getGeneralPlanAttributes(): Promise<IResponseBase> {
    try {
      const planAttributes = await this._context.PlanAttributeRepo.find({
        where: {
          isDefault: true,
        },
      });
      return {
        data: planAttributes,
        error: null,
        message: "Lấy danh sách thuộc tính dịch vụ chung thành công",
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
        status: StatusCodes.BAD_REQUEST,
      };
    }
  }

  async getDefaultPlanAttributes(): Promise<IResponseBase> {
    try {
      const planAttributes = await this._context.PlanAttributeRepo.find({
        where: {
          isDefault: true,
        },
      });
      return {
        data: planAttributes,
        error: null,
        message: "Lấy danh sách thuộc tính dịch vụ mặc định thành công",
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
        status: StatusCodes.BAD_REQUEST,
      };
    }
  }
  async createPlanAttributes(dataAddNew: IAddNewPlanAttributeDTO): Promise<IResponseBase> {
    const { planAttributes } = dataAddNew;
    if (!planAttributes || planAttributes.length === 0) {
      return {
        data: null,
        error: null,
        message: "Vui lòng kiểm tra lại dữ liệu của bạn",
        success: false,
        status: StatusCodes.BAD_REQUEST,
      };
    }
    const checkValidate = planAttributes.some((planAttribute) => {
      return !planAttribute.name || !planAttribute.displayName || !planAttribute.dataType;
    });
    if (checkValidate) {
      return {
        data: null,
        error: null,
        message: "Vui lòng kiểm tra lại dữ liệu của bạn",
        success: false,
        status: StatusCodes.BAD_REQUEST,
      };
    }
    const checkNameUnique = {
      name: null,
      type: null,
    };
    const checkTasks = planAttributes.map(async (planAttribute) => {
      if (checkNameUnique.name) return;

      const checkNameInNewList = planAttributes.filter((item) => item.name === planAttribute.name);
      if (checkNameInNewList.length > 1) {
        checkNameUnique.name = planAttribute.name;
        checkNameUnique.type = "bị trùng";
        return;
      }

      console.log("planAttribute", planAttribute);
      console.log("planAttribute.planTypeId", planAttribute.planTypeId);
      const checkNameInDB = await this._context.PlanAttributeRepo.findOne({
        where: {
          name: planAttribute.name,
          planTypeId: planAttribute.planTypeId ?? IsNull(),
        },
      });
      console.log("checkNameInDB", checkNameInDB);

      if (checkNameInDB) {
        checkNameUnique.name = checkNameInDB.name;
        checkNameUnique.type = "đã tồn tại";
        return;
      }

      planAttribute.id = uuid();
      planAttribute.createdAt = new Date();
      planAttribute.updatedAt = new Date();
    });

    await Promise.all(checkTasks);
    if (checkNameUnique.name) {
      return {
        data: null,
        error: null,
        message: `Dịch vụ ${checkNameUnique.name} ${checkNameUnique.type}`,
        success: false,
        status: StatusCodes.BAD_REQUEST,
      };
    }

    const queryRunner = this._context.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const planAttributesCreated = await this._context.PlanAttributeRepo.save(planAttributes);
      // Commit transaction
      await queryRunner.commitTransaction();
      return {
        data: planAttributesCreated,
        error: null,
        message: "Thêm mới thuộc tính dịch vụ thành công",
        success: true,
        status: StatusCodes.OK,
      };
    } catch (error) {
      logger.error(error.message);
      await queryRunner.rollbackTransaction();
      console.log(`Error in Feedback - method sendFeedback() at ${new Date().getTime()} with message ${error.message}`);
      return {
        data: null,
        error: null,
        message: "Hệ thống đang gặp sự cố, vui lòng thử lại sau",
        success: true,
        status: StatusCodes.BAD_REQUEST,
      };
    } finally {
      await queryRunner.release();
    }
  }

  async createNewPlanType(data: ICreateNewPlanTypeDTO): Promise<IResponseBase> {
    const { name, displayName, description, planAttributes } = data;
    if (!name || !displayName || !planAttributes) {
      return {
        data: null,
        error: null,
        message: "Vui lòng kiểm tra lại dữ liệu của bạn",
        success: false,
        status: StatusCodes.BAD_REQUEST,
      };
    }
    const checkNameInDB = await this._context.PlanTypeRepo.findOne({
      where: {
        name,
      },
    });
    if (checkNameInDB) {
      return {
        data: null,
        error: null,
        message: "Loại dịch vụ đã tồn tại",
        success: false,
        status: StatusCodes.BAD_REQUEST,
      };
    }
    const planType = {
      id: uuid(),
      name,
      displayName,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const queryRunner = this._context.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const planTypeCreated = await this._context.PlanTypeRepo.save(planType);
      const planAttributesCreated = planAttributes.map((planAttribute) => {
        planAttribute.id = uuid();
        planAttribute.planTypeId = planTypeCreated.id;
        planAttribute.isDefault = false;
        planAttribute.createdAt = new Date();
        planAttribute.updatedAt = new Date();
        return planAttribute;
      });

      await this.createPlanAttributes({ planAttributes: planAttributesCreated });
      // Commit transaction
      await queryRunner.commitTransaction();
      return {
        data: planTypeCreated,
        error: null,
        message: "Thêm mới loại dịch vụ thành công",
        success: true,
        status: StatusCodes.OK,
      };
    } catch (error) {
      logger.error(error.message);
      await queryRunner.rollbackTransaction();
      console.log(`Error in Feedback - method sendFeedback() at ${new Date().getTime()} with message ${error.message}`);
      return {
        data: null,
        error: null,
        message: "Hệ thống đang gặp sự cố, vui lòng thử lại sau",
        success: true,
        status: StatusCodes.BAD_REQUEST,
      };
    } finally {
      await queryRunner.release();
    }
  }

  async updatePlanAttribute(dataUpdate: IUpdatePlanAttributeDTO): Promise<IResponseBase> {
    try {
      if (!dataUpdate.dataType || !dataUpdate.displayName || !dataUpdate.name || !dataUpdate.id) {
        return {
          data: null,
          error: null,
          message: "Vui lòng kiểm tra lại dữ liệu của bạn",
          success: false,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const planAttribute = await this._context.PlanAttributeRepo.findOne({
        where: {
          id: dataUpdate.id,
        },
      });
      if (!planAttribute) {
        return {
          data: null,
          error: null,
          message: "Thuộc tính dịch vụ không tồn tại",
          success: false,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const checkNameInDB = await this._context.PlanAttributeRepo.find({
        where: {
          name: dataUpdate.name,
          planTypeId: planAttribute.planTypeId,
        },
      });
      if (checkNameInDB.length > 1) {
        return {
          data: null,
          error: null,
          message: "Tên thuộc tính dịch vụ đã tồn tại",
          success: false,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      planAttribute.name = dataUpdate.name;
      planAttribute.displayName = dataUpdate.displayName;
      planAttribute.dataType = dataUpdate.dataType;
      planAttribute.note = dataUpdate.note;
      planAttribute.updatedAt = new Date();
      await this._context.PlanAttributeRepo.save(planAttribute);
      return {
        data: planAttribute,
        error: null,
        message: "Cập nhật thuộc tính dịch vụ thành công",
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
        status: StatusCodes.BAD_REQUEST,
      };
    }
  }

  async updatePlanType(data: IUpdatePlanTypeDTO): Promise<IResponseBase> {
    try {
      if (!data.displayName || !data.name) {
        return {
          data: null,
          error: null,
          message: "Vui lòng kiểm tra lại dữ liệu của bạn",
          success: false,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const planType = await this._context.PlanTypeRepo.findOne({
        where: {
          name: data.name,
        },
      });
      if (!planType) {
        return {
          data: null,
          error: null,
          message: "Loại dịch vụ không tồn tại",
          success: false,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const checkNameInDB = await this._context.PlanTypeRepo.findOne({
        where: {
          name: data.name,
        },
      });
      if (checkNameInDB) {
        return {
          data: null,
          error: null,
          message: "Tên loại dịch vụ đã tồn tại",
          success: false,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      planType.displayName = data.displayName;
      planType.description = data.description;
      planType.updatedAt = new Date();
      await this._context.PlanTypeRepo.save(planType);
      return {
        data: planType,
        error: null,
        message: "Cập nhật loại dịch vụ thành công",
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
        status: StatusCodes.BAD_REQUEST,
      };
    }
  }
  async deletePlanAttribute(attributeId: string): Promise<IResponseBase> {
    try {
      if (!attributeId) {
        return {
          data: null,
          error: null,
          message: "Vui lòng kiểm tra lại dữ liệu của bạn",
          success: false,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const planAttribute = await this._context.PlanAttributeRepo.findOne({
        where: {
          id: attributeId,
        },
      });
      if (!planAttribute) {
        return {
          data: null,
          error: null,
          message: "Thuộc tính dịch vụ không tồn tại",
          success: false,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      await this._context.PlanAttributeRepo.delete({
        id: attributeId,
      });

      return {
        data: planAttribute,
        error: null,
        message: "Xóa thuộc tính dịch vụ thành công",
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
        status: StatusCodes.BAD_REQUEST,
      };
    }
  }

  async deletePlanType(typeId: string): Promise<IResponseBase> {
    try {
      if (!typeId) {
        return {
          data: null,
          error: null,
          message: "Vui lòng kiểm tra lại dữ liệu của bạn",
          success: false,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const planType = await this._context.PlanTypeRepo.findOne({
        where: {
          id: typeId,
        },
      });
      if (!planType) {
        return {
          data: null,
          error: null,
          message: "Loại dịch vụ không tồn tại",
          success: false,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      await this._context.PlanTypeRepo.delete({
        id: typeId,
      });
      return {
        data: planType,
        error: null,
        message: "Xóa loại dịch vụ thành công",
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
        status: StatusCodes.BAD_REQUEST,
      };
    }
  }
}
