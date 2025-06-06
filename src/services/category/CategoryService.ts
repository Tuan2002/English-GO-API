import { ErrorMessages } from "@/constants/ErrorMessages";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import { ICategoryRequestData } from "@/interfaces/category/ICategoryDTO";
import ICategoryService from "@/interfaces/category/ICategoryService";
import { StatusCodes } from "http-status-codes";
import { v4 as uuid } from "uuid";
import DatabaseService from "../database/DatabaseService";
import logger from "@/helpers/logger";
export class CategoryService implements ICategoryService {
  private readonly _context: DatabaseService;
  constructor(DatabaseService: DatabaseService) {
    this._context = DatabaseService;
  }
  async getAllCategories(): Promise<IResponseBase> {
    try {
      const categories = await this._context.CategoryRepo.find({
        order: {
          createdAt: "DESC",
        },
      });
      return {
        status: StatusCodes.OK,
        success: true,
        message: "Get all categories successfully",
        data: categories,
        error: null,
      };
    } catch (error) {
      logger.error(error?.message);
      console.log(`Error in AuthService - method getAllCategories() at ${new Date().getTime()} with message ${error?.message}`);
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: {
          message: ErrorMessages.INTERNAL_SERVER_ERROR,
          errorDetail: error.message,
        },
      };
    }
  }
  async getCategoryById(id: string): Promise<IResponseBase> {
    try {
      const category = await this._context.CategoryRepo.findOne({
        where: { id },
        order: {
          createdAt: "DESC",
        },
      });
      if (!category) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          message: "Category not found",
          data: null,
          error: {
            message: "Category not found",
            errorDetail: "Category not found",
          },
        };
      }
      return {
        status: StatusCodes.OK,
        success: true,
        message: "Get category by id successfully",
        data: category,
        error: null,
      };
    } catch (error) {
      logger.error(error?.message);
      console.log(`Error in CategoryService - method getCategoryById at ${new Date().getTime()} with message ${error?.message}`);
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: {
          message: ErrorMessages.INTERNAL_SERVER_ERROR,
          errorDetail: error.message,
        },
      };
    }
  }
  async getCategoryOfLevel(levelId: string): Promise<IResponseBase> {
    try {
      const category = await this._context.CategoryRepo.find({
        where: { levelId, isDeleted: false },
        order: {
          createdAt: "DESC",
        },
      });
      return {
        status: StatusCodes.OK,
        success: true,
        message: "Get category by id successfully",
        data: category,
        error: null,
      };
    } catch (error) {
      logger.error(error?.message);
      console.log(
        `Error in CategoryService - method getCategoryOfLevel at ${new Date().getTime()} with message ${error?.message}`
      );
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: {
          message: ErrorMessages.INTERNAL_SERVER_ERROR,
          errorDetail: error.message,
        },
      };
    }
  }
  async getCategoryOfSkill(skillId: string): Promise<IResponseBase> {
    try {
      const category = await this._context.CategoryRepo.find({
        where: { skillId },
        order: {
          createdAt: "DESC",
        },
      });
      return {
        status: StatusCodes.OK,
        success: true,
        message: "Get category by id successfully",
        data: category,
        error: null,
      };
    } catch (error) {
      logger.error(error?.message);
      console.log(
        `Error in CategoryService - method getCategoryOfSkill at ${new Date().getTime()} with message ${error?.message}`
      );
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: {
          message: ErrorMessages.INTERNAL_SERVER_ERROR,
          errorDetail: error.message,
        },
      };
    }
  }
  async createNewCategory(dataCreate: ICategoryRequestData): Promise<IResponseBase> {
    try {
      if (!dataCreate.name) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          message: "Category name is required",
          data: null,
          error: {
            message: "Category name is required",
            errorDetail: "Category name is required",
          },
        };
      }
      if (!dataCreate.skillId || !dataCreate.levelId) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          message: "Skill and Level is required",
          data: null,
          error: {
            message: "Skill and Level is required",
            errorDetail: "Skill and Level is required",
          },
        };
      }
      dataCreate.id = uuid();
      const category = this._context.CategoryRepo.create(dataCreate);
      await this._context.CategoryRepo.save(category);
      const createdCategory = await this._context.CategoryRepo.findOne({
        where: {
          id: category.id,
        },
      });
      if (!createdCategory) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          message: "Cateogry created not found",
          data: null,
          error: {
            message: ErrorMessages.INTERNAL_SERVER_ERROR,
            errorDetail: "Category created not found",
          },
        };
      }
      return {
        status: StatusCodes.CREATED,
        success: true,
        message: "Create new category successfully",
        data: createdCategory,
        error: null,
      };
    } catch (error) {
      logger.error(error?.message);
      console.log(
        `Error in CategoryService - method createNewCategory at ${new Date().getTime()} with message ${error?.message}`
      );
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: {
          message: ErrorMessages.INTERNAL_SERVER_ERROR,
          errorDetail: error.message,
        },
      };
    }
  }
  async updateCategory(id: string, dataUpdate: ICategoryRequestData): Promise<IResponseBase> {
    try {
      if (!id) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          message: "Category id is required",
          data: null,
          error: {
            message: "Category id is required",
            errorDetail: "Category id is required",
          },
        };
      }
      if (!dataUpdate.name) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          message: "Category name is required",
          data: null,
          error: {
            message: "Category name is required",
            errorDetail: "Category name is required",
          },
        };
      }
      if (!dataUpdate.skillId || !dataUpdate.levelId) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          message: "Skill and Level is required",
          data: null,
          error: {
            message: "Skill and Level is required",
            errorDetail: "Skill and Level is required",
          },
        };
      }
      const category = this._context.CategoryRepo.create(dataUpdate);
      await this._context.CategoryRepo.save(category);
      const createdCategory = await this._context.CategoryRepo.findOne({
        where: {
          id: category.id,
        },
      });
      if (!createdCategory) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          message: "Cateogry created not found",
          data: null,
          error: {
            message: ErrorMessages.INTERNAL_SERVER_ERROR,
            errorDetail: "Category created not found",
          },
        };
      }
      return {
        status: StatusCodes.CREATED,
        success: true,
        message: "Update category successfully",
        data: createdCategory,
        error: null,
      };
    } catch (error) {
      logger.error(error?.message);
      console.log(`Error in CategoryService - method updateCategory at ${new Date().getTime()} with message ${error?.message}`);
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: {
          message: ErrorMessages.INTERNAL_SERVER_ERROR,
          errorDetail: error.message,
        },
      };
    }
  }
  async deleteCategory(id: string): Promise<IResponseBase> {
    try {
      if (!id) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          message: "Category id is required",
          data: null,
          error: {
            message: "Category id is required",
            errorDetail: "Category id is required",
          },
        };
      }
      const category = await this._context.CategoryRepo.findOne({
        where: {
          id,
        },
      });
      if (!category || category.isDeleted) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          message: "Category not found or deleted",
          data: null,
          error: {
            message: "Category not found or deleted",
            errorDetail: "Category not found or deleted",
          },
        };
      }
      category.isDeleted = true;
      await this._context.CategoryRepo.save(category);
      return {
        status: StatusCodes.OK,
        success: true,
        message: "Delete category successfully",
        data: category,
        error: null,
      };
    } catch (error) {
      logger.error(error?.message);
      console.log(`Error in CategoryService - method deleteCategory at ${new Date().getTime()} with message ${error?.message}`);
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: {
          message: ErrorMessages.INTERNAL_SERVER_ERROR,
          errorDetail: error.message,
        },
      };
    }
  }
  async deleteCategoryPermanently(id: string): Promise<IResponseBase> {
    try {
      if (!id) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          message: "Category id is required",
          data: null,
          error: {
            message: "Category id is required",
            errorDetail: "Category id is required",
          },
        };
      }
      const category = await this._context.CategoryRepo.findOne({
        where: {
          id,
        },
      });
      if (!category) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          message: "Category not found",
          data: null,
          error: {
            message: "Category not found",
            errorDetail: "Category not found",
          },
        };
      }
      await this._context.CategoryRepo.delete(id);
      return {
        status: StatusCodes.OK,
        success: true,
        message: "Delete category permanently successfully",
        data: category,
        error: null,
      };
    } catch (error) {
      logger.error(error?.message);
      console.log(
        `Error in CategoryService - method deleteCategoryPermanently at ${new Date().getTime()} with message ${error?.message}`
      );
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: {
          message: ErrorMessages.INTERNAL_SERVER_ERROR,
          errorDetail: error.message,
        },
      };
    }
  }
  async restoreCategory(id: string): Promise<IResponseBase> {
    try {
      if (!id) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          message: "Category id is required",
          data: null,
          error: {
            message: "Category id is required",
            errorDetail: "Category id is required",
          },
        };
      }
      const category = await this._context.CategoryRepo.findOne({
        where: {
          id,
        },
      });
      if (!category || !category.isDeleted) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          message: "Category not found or not deleted",
          data: null,
          error: {
            message: "Category not found or not deleted",
            errorDetail: "Category not found or not deleted",
          },
        };
      }
      category.isDeleted = false;
      await this._context.CategoryRepo.save(category);
      return {
        status: StatusCodes.OK,
        success: true,
        message: "Restore category successfully",
        data: category,
        error: null,
      };
    } catch (error) {
      logger.error(error?.message);
      console.log(`Error in CategoryService - method restoreCategory at ${new Date().getTime()} with message ${error?.message}`);
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: {
          message: ErrorMessages.INTERNAL_SERVER_ERROR,
          errorDetail: error.message,
        },
      };
    }
  }
  async activeCategory(id: string): Promise<IResponseBase> {
    try {
      if (!id) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          message: "Category id is required",
          data: null,
          error: {
            message: "Category id is required",
            errorDetail: "Category id is required",
          },
        };
      }
      const category = await this._context.CategoryRepo.findOne({
        where: {
          id,
        },
      });
      if (!category || category.isActive) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          message: "Category not found or active",
          data: null,
          error: {
            message: "Category not found or active",
            errorDetail: "Category not found or active",
          },
        };
      }
      category.isActive = true;
      await this._context.CategoryRepo.save(category);
      return {
        status: StatusCodes.OK,
        success: true,
        message: "Active category successfully",
        data: category,
        error: null,
      };
    } catch (error) {
      logger.error(error?.message);
      console.log(`Error in CategoryService - method activeCategory at ${new Date().getTime()} with message ${error?.message}`);
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: {
          message: ErrorMessages.INTERNAL_SERVER_ERROR,
          errorDetail: error.message,
        },
      };
    }
  }
  async inactiveCategory(id: string): Promise<IResponseBase> {
    try {
      if (!id) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          message: "Category id is required",
          data: null,
          error: {
            message: "Category id is required",
            errorDetail: "Category id is required",
          },
        };
      }
      const category = await this._context.CategoryRepo.findOne({
        where: {
          id,
        },
      });
      if (!category || !category.isActive) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          message: "Category not found or inactive",
          data: null,
          error: {
            message: "Category not found or inactive",
            errorDetail: "Category not found or inactive",
          },
        };
      }
      category.isActive = false;
      await this._context.CategoryRepo.save(category);
      return {
        status: StatusCodes.OK,
        success: true,
        message: "Inactive category successfully",
        data: category,
        error: null,
      };
    } catch (error) {
      logger.error(error?.message);
      console.log(`Error in CategoryService - method inactiveCategory at ${new Date().getTime()} with message ${error?.message}`);
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: {
          message: ErrorMessages.INTERNAL_SERVER_ERROR,
          errorDetail: error.message,
        },
      };
    }
  }
}
