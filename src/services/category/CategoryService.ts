import { ErrorMessages } from "@/constants/ErrorMessages";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import { ICategoryRequestData } from "@/interfaces/category/ICategoryDTO";
import ICategoryService from "@/interfaces/category/ICategoryService";
import { Repo } from "@/repository";
import { StatusCodes } from "http-status-codes";

export class CategoryService implements ICategoryService {
  constructor() {}
  async getAllCategories(): Promise<IResponseBase> {
    try {
      const categories = await Repo.CategoryRepo.find({
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
      const category = await Repo.CategoryRepo.findOne({
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
      const category = await Repo.CategoryRepo.find({
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
      const category = await Repo.CategoryRepo.find({
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
      dataCreate.id = Repo.createUUID();
      const category = Repo.CategoryRepo.create(dataCreate);
      await Repo.CategoryRepo.save(category);
      const createdCategory = await Repo.CategoryRepo.findOne({
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
      const category = Repo.CategoryRepo.create(dataUpdate);
      await Repo.CategoryRepo.save(category);
      const createdCategory = await Repo.CategoryRepo.findOne({
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
      const category = await Repo.CategoryRepo.findOne({
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
      await Repo.CategoryRepo.save(category);
      return {
        status: StatusCodes.OK,
        success: true,
        message: "Delete category successfully",
        data: category,
        error: null,
      };
    } catch (error) {
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
      const category = await Repo.CategoryRepo.findOne({
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
      await Repo.CategoryRepo.delete(id);
      return {
        status: StatusCodes.OK,
        success: true,
        message: "Delete category permanently successfully",
        data: category,
        error: null,
      };
    } catch (error) {
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
      const category = await Repo.CategoryRepo.findOne({
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
      await Repo.CategoryRepo.save(category);
      return {
        status: StatusCodes.OK,
        success: true,
        message: "Restore category successfully",
        data: category,
        error: null,
      };
    } catch (error) {
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
      const category = await Repo.CategoryRepo.findOne({
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
      await Repo.CategoryRepo.save(category);
      return {
        status: StatusCodes.OK,
        success: true,
        message: "Active category successfully",
        data: category,
        error: null,
      };
    } catch (error) {
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
      const category = await Repo.CategoryRepo.findOne({
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
      await Repo.CategoryRepo.save(category);
      return {
        status: StatusCodes.OK,
        success: true,
        message: "Inactive category successfully",
        data: category,
        error: null,
      };
    } catch (error) {
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
