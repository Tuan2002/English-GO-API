import { ErrorMessages } from "@/constants/ErrorMessages";
import { Brackets, ILike } from "typeorm";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import IUserService from "@/interfaces/user/IUserService";
import { Repo } from "@/repository";
import { StatusCodes } from "http-status-codes";
import { ICreateUserData } from "@/interfaces/user/UserDTO";
import { User } from "@/entity/User";
import { v4 as uuidv4 } from "uuid";
import Extensions from "@/utils/Extensions";
import IRoleService from "@/interfaces/auth/IRoleService";
import RoleService from "../auth/RoleService";

export default class UserService implements IUserService {
  private _roleService: IRoleService;
  constructor() {
    // constructor code
    this._roleService = new RoleService();
  }
  async getUserByEmail(email: string): Promise<IResponseBase> {
    try {
      if (!email) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          errorMessage: "Email is required",
          data: null,
          error: {
            message: "Bad Request",
            errorDetail: "Email is required",
          },
        };
      }
      const user = await Repo.UserRepo.findOne({
        where: {
          email,
        },
        relations: ["groupRole"],
      });
      return {
        status: StatusCodes.OK,
        success: true,
        data: user,
        error: null,
      };
    } catch {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        errorMessage: "Internal Server Error",
        data: null,
        error: {
          message: "Internal Server Error",
          errorDetail: "Internal Server Error",
        },
      };
    }
  }

  async getAllUser(page: number = 1, limit: number = 10, search: string = ""): Promise<IResponseBase> {
    try {
      const totalCountQuery = Repo.UserRepo.count({
        where: [
          {
            isDeleted: false,
            fullName: ILike(`%${search}%`),
          },
          {
            isDeleted: false,
            email: ILike(`%${search}%`),
          },
        ],
      });
      const usersQuery = Repo.UserRepo.createQueryBuilder("user")
        .innerJoinAndSelect("user.groupRole", "groupRole")
        .where("user.isDeleted = :isDeleted", { isDeleted: false })
        .andWhere(
          new Brackets((qb) => {
            qb.where("user.fullName ILIKE :fullName", { fullName: `%${search}%` }).orWhere("user.email ILIKE :email", {
              email: `%${search}%`,
            });
          })
        )
        .orderBy("user.createdAt", "DESC")
        .select([
          "user.id",
          "user.avatar",
          "user.fullName",
          "user.groupRoleId",
          "user.groupRole",
          "user.email",
          "user.isActive",
          "user.isBlocked",
          "user.isDeleted",
          "user.createdAt",
          "groupRole.name",
          "groupRole.displayName",
        ])
        .skip(Number((page - 1) * limit))
        .take(limit)
        .getMany();

      const [totalItem, users] = await Promise.all([totalCountQuery, usersQuery]);
      return {
        status: StatusCodes.OK,
        success: false,
        errorMessage: null,
        data: {
          users,
          page,
          limit,
          totalItem,
          totalPage: Math.ceil(totalItem / limit),
        },
        error: null,
      };
    } catch (error: any) {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        errorMessage: ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: {
          message: ErrorMessages.INTERNAL_SERVER_ERROR,
          errorDetail: error.message,
        },
      };
    }
  }

  async getDeletedUsers(page: number = 1, limit: number = 10, search: string = ""): Promise<IResponseBase> {
    try {
      const [users, totalItem] = await Repo.UserRepo.findAndCount({
        where: [
          {
            isDeleted: true,
            fullName: ILike(`%${search}%`),
          },
          {
            isDeleted: true,
            email: ILike(`%${search}%`),
          },
        ],

        select: ["id", "avatar", "fullName", "groupRoleId", "groupRole", "email", "isActive", "isBlocked", "isDeleted"],
        skip: (page - 1) * limit,
        take: limit,
      });
      return {
        status: StatusCodes.OK,
        success: false,
        errorMessage: null,
        data: {
          users,
          page,
          limit,
          totalItem,
          totalPage: Math.ceil(totalItem / limit),
        },
        error: null,
      };
    } catch {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        errorMessage: ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: {
          message: ErrorMessages.INTERNAL_SERVER_ERROR,
          errorDetail: ErrorMessages.INTERNAL_SERVER_ERROR,
        },
      };
    }
  }

  async getUserById(userId: string): Promise<IResponseBase> {
    try {
      const user = await Repo.UserRepo.findOne({
        where: {
          id: userId,
          isDeleted: false,
        },
        select: ["id", "avatar", "fullName", "groupRoleId", "groupRole", "email", "isActive", "isBlocked", "isDeleted"],
      });

      if (!user) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          errorMessage: "Không tìm thấy thông tin người dùng hoặc người dùng đã bị xoá",
          data: null,
          error: {
            message: ErrorMessages.NOT_FOUND,
            errorDetail: "Không tìm thấy thông tin người dùng hoặc người dùng đã bị xoá",
          },
        };
      }

      return {
        status: StatusCodes.OK,
        success: true,
        errorMessage: null,
        data: user,
        error: null,
      };
    } catch (error: any) {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        errorMessage: ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: {
          message: ErrorMessages.INTERNAL_SERVER_ERROR,
          errorDetail: error.message,
        },
      };
    }
  }

  async createUser(data: ICreateUserData): Promise<IResponseBase> {
    try {
      const userData = new User();
      userData.email = data.email;
      userData.password = Extensions.hashPassword(data.password);
      userData.fullName = data.fullName;
      userData.avatar = data.avatar;
      userData.groupRoleId = data.groupRoleId;
      userData.id = uuidv4();

      const checkEmailExist = await this.getUserByEmail(userData.email);
      if (checkEmailExist.success && checkEmailExist.data) {
        return {
          status: StatusCodes.CONFLICT,
          success: false,
          errorMessage: "Email đã tồn tại trên hệ thống",
          data: null,
          error: {
            message: "Conflict",
            errorDetail: "Email đã tồn tại trên hệ thống",
          },
        };
      }

      const checkRole = await this._roleService.getGroupRole(data.groupRoleId);
      if (!checkRole.success || !checkRole.data) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          errorMessage: "Đăng kí tài khoản không thành công",
          data: null,
          error: {
            message: "Phân quyền không tồn tại",
            errorDetail: "Phân quyền bạn chọn không tồn tại trên hệ thống",
          },
        };
      }

      const user = Repo.UserRepo.create(userData);
      await Repo.UserRepo.save(user);

      return {
        status: StatusCodes.CREATED,
        success: true,
        errorMessage: null,
        data: user,
        error: null,
      };
    } catch (error: any) {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        errorMessage: ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: {
          message: ErrorMessages.INTERNAL_SERVER_ERROR,
          errorDetail: error.message,
        },
      };
    }
  }

  async updateUser(userId: string, data: ICreateUserData): Promise<IResponseBase> {
    try {
      const userData = new User();
      userData.fullName = data.fullName;
      userData.avatar = data.avatar;
      userData.groupRoleId = data.groupRoleId;
      userData.password = Extensions.hashPassword(data.password);

      const checkRole = await this._roleService.getGroupRole(data.groupRoleId);
      if (!checkRole.success || !checkRole.data) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          errorMessage: "Phân quyền không tồn tại",
          data: null,
          error: {
            message: "Phân quyền không tồn tại",
            errorDetail: "Phân quyền bạn chọn không tồn tại trên hệ thống",
          },
        };
      }
      const user = await Repo.UserRepo.findOne({
        where: {
          id: userId,
        },
      });
      const updatedUser = Repo.UserRepo.merge(user, userData);
      await Repo.UserRepo.save(updatedUser);
      return {
        status: StatusCodes.OK,
        success: true,
        errorMessage: null,
        data: updatedUser,
        error: null,
      };
    } catch (error: any) {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        errorMessage: ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: {
          message: ErrorMessages.INTERNAL_SERVER_ERROR,
          errorDetail: error.message,
        },
      };
    }
  }

  async deleteUser(userId: string): Promise<IResponseBase> {
    try {
      const user = await Repo.UserRepo.findOne({
        where: {
          id: userId,
          isDeleted: false,
        },
      });
      if (!user) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          errorMessage: "Không tìm thấy thông tin người dùng hoặc người dùng đã bị xoá",
          data: null,
          error: {
            message: ErrorMessages.NOT_FOUND,
            errorDetail: "Không tìm thấy thông tin người dùng hoặc người dùng đã bị xoá",
          },
        };
      }
      user.isDeleted = true;
      await Repo.UserRepo.save(user);
      return {
        status: StatusCodes.OK,
        success: true,
        errorMessage: null,
        data: {
          message: "Xóa người dùng thành công",
          userId,
        },
        error: null,
      };
    } catch (error: any) {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        errorMessage: ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: {
          message: ErrorMessages.INTERNAL_SERVER_ERROR,
          errorDetail: error.message,
        },
      };
    }
  }

  async restoreUser(userId: string): Promise<IResponseBase> {
    try {
      const user = await Repo.UserRepo.findOne({
        where: {
          id: userId,
          isDeleted: true,
        },
      });
      if (!user) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          errorMessage: "Không tìm thấy thông tin người dùng hoặc người dùng đã bị xoá",
          data: null,
          error: {
            message: ErrorMessages.NOT_FOUND,
            errorDetail: "Không tìm thấy thông tin người dùng hoặc người dùng đã bị xoá",
          },
        };
      }
      user.isDeleted = false;
      await Repo.UserRepo.save(user);
      return {
        status: StatusCodes.OK,
        success: true,
        errorMessage: null,
        data: {
          message: "Khôi phục người dùng thành công",
          userId,
        },
        error: null,
      };
    } catch (error: any) {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        errorMessage: ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: {
          message: ErrorMessages.INTERNAL_SERVER_ERROR,
          errorDetail: error.message,
        },
      };
    }
  }

  async deletePermanentlyUser(userId: string): Promise<IResponseBase> {
    try {
      const user = await Repo.UserRepo.findOne({
        where: {
          id: userId,
        },
      });
      if (!user) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          errorMessage: "Không tìm thấy thông tin người dùng hoặc người dùng đã bị xoá",
          data: null,
          error: {
            message: ErrorMessages.NOT_FOUND,
            errorDetail: "Không tìm thấy thông tin người dùng hoặc người dùng đã bị xoá",
          },
        };
      }
      await Repo.UserRepo.delete(userId);
      return {
        status: StatusCodes.OK,
        success: true,
        errorMessage: null,
        data: {
          message: "Xóa người dùng vĩnh viễn thành công",
          userId,
        },
        error: null,
      };
    } catch (error: any) {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        errorMessage: ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: {
          message: ErrorMessages.INTERNAL_SERVER_ERROR,
          errorDetail: error.message,
        },
      };
    }
  }
}
