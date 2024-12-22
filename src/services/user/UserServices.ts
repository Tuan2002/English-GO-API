import { ErrorMessages } from "@/constants/ErrorMessages";
import { User } from "@/entity/User";
import IRoleService from "@/interfaces/auth/IRoleService";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import IUserService from "@/interfaces/user/IUserService";
import { ICreateUserData, IUpdateUserData } from "@/interfaces/user/UserDTO";
import Extensions from "@/utils/Extensions";
import { StatusCodes } from "http-status-codes";
import { Brackets, ILike } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import DatabaseService from "../database/DatabaseService";
import logger from "@/helpers/logger";

export default class UserService implements IUserService {
  private readonly _roleService: IRoleService;
  private readonly _context: DatabaseService;
  constructor(DatabaseService: DatabaseService, RoleService: IRoleService) {
    this._context = DatabaseService;
    this._roleService = RoleService;
  }
  async getUserByUsername(username: string): Promise<IResponseBase> {
    try {
      if (!username) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          message: "Tài khoản không được để trống",
          data: null,
          error: {
            message: "Bad Request",
            errorDetail: "Tài khoản không được để trống",
          },
        };
      }
      const user = await this._context.UserRepo.createQueryBuilder("user")
        .innerJoinAndSelect("user.groupRole", "groupRole")
        .where("user.isDeleted = :isDeleted", { isDeleted: false })
        .andWhere("user.username = :username", { username })
        .orderBy("user.createdAt", "DESC")
        .select([
          "user.id",
          "user.avatar",
          "user.fullName",
          "user.groupRoleId",
          "user.groupRole",
          "user.email",
          "user.username",
          "user.isBlocked",
          "user.isDeleted",
          "user.createdAt",
          "groupRole.name",
          "groupRole.displayName",
        ])
        .getOne();
      return {
        status: StatusCodes.OK,
        success: true,
        data: user,
        error: null,
      };
    } catch (error: any) {
      logger.error(error?.message);
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

  async getAllUser(page: number = 1, limit: number = 10, search: string = ""): Promise<IResponseBase> {
    try {
      const totalCountQuery = this._context.UserRepo.count({
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
      const usersQuery = this._context.UserRepo.createQueryBuilder("user")
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
        .select(["user", "groupRole.name", "groupRole.displayName"])
        .skip(Number((page - 1) * limit))
        .take(limit)
        .getMany();

      const [totalItem, users] = await Promise.all([totalCountQuery, usersQuery]);
      return {
        status: StatusCodes.OK,
        success: false,
        message: null,
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
      logger.error(error?.message);
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

  async getDeletedUsers(page: number = 1, limit: number = 10, search: string = ""): Promise<IResponseBase> {
    try {
      const [users, totalItem] = await this._context.UserRepo.findAndCount({
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

        select: ["id", "avatar", "fullName", "groupRoleId", "groupRole", "email", "isBlocked", "isDeleted"],
        skip: (page - 1) * limit,
        take: limit,
      });
      return {
        status: StatusCodes.OK,
        success: false,
        message: null,
        data: {
          users,
          page,
          limit,
          totalItem,
          totalPage: Math.ceil(totalItem / limit),
        },
        error: null,
      };
    } catch (error) {
      logger.error(error?.message);
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

  async getUserById(userId: string): Promise<IResponseBase> {
    try {
      const user = await this._context.UserRepo.createQueryBuilder("user")
        .innerJoinAndSelect("user.groupRole", "groupRole")
        .where("user.isDeleted = :isDeleted", { isDeleted: false })
        .andWhere("user.id = :userId", { userId })
        .orderBy("user.createdAt", "DESC")
        .select(["user", "groupRole.name", "groupRole.displayName"])
        .getOne();
      delete user?.password;

      if (!user) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          message: "Không tìm thấy thông tin người dùng hoặc người dùng đã bị xoá",
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
        message: null,
        data: user,
        error: null,
      };
    } catch (error: any) {
      logger.error(error?.message);
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

  async createUser(data: ICreateUserData): Promise<IResponseBase> {
    try {
      const userData = new User();
      userData.email = data.email;
      userData.username = data.username;
      userData.password = Extensions.hashPassword(data.password);
      userData.fullName = data.fullName;
      userData.avatar = data.avatar;
      userData.groupRoleId = data.groupRoleId;
      userData.id = uuidv4();

      const checkUsernameIsExists = await this.getUserByUsername(userData.username);
      if (checkUsernameIsExists.success && checkUsernameIsExists.data) {
        return {
          status: StatusCodes.CONFLICT,
          success: false,
          message: "Tài khoản đã tồn tại trên hệ thống",
          data: null,
          error: {
            message: "Conflict",
            errorDetail: "Tài khoản đã tồn tại trên hệ thống",
          },
        };
      }

      const checkRole = await this._roleService.getGroupRole(data.groupRoleId);
      if (!checkRole.success || !checkRole.data) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          message: "Đăng kí tài khoản không thành công",
          data: null,
          error: {
            message: "Phân quyền không tồn tại",
            errorDetail: "Phân quyền bạn chọn không tồn tại trên hệ thống",
          },
        };
      }

      const user = this._context.UserRepo.create(userData);
      await this._context.UserRepo.save(user);

      const userCreated = await this.getUserById(user.id);
      if (!userCreated.success || !userCreated.data) {
        return {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          success: false,
          message: "Lỗi khi tạo mới người dùng",
          data: null,
          error: {
            message: ErrorMessages.INTERNAL_SERVER_ERROR,
            errorDetail: "Lỗi khi tạo mới người dùng",
          },
        };
      }

      return {
        status: StatusCodes.CREATED,
        success: true,
        message: null,
        data: userCreated.data,
        error: null,
      };
    } catch (error: any) {
      logger.error(error?.message);
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

  async updateUser(userId: string, data: IUpdateUserData): Promise<IResponseBase> {
    try {
      const userData = new User();
      userData.fullName = data.fullName;
      userData.avatar = data.avatar;
      userData.email = data.email;
      userData.phoneNumber = data.phoneNumber;
      userData.birthday = data.birthday;
      userData.gender = data.gender;
      userData.id = userId;
      userData.groupRoleId = data.groupRoleId;

      const checkRole = await this._roleService.getGroupRole(data.groupRoleId);
      if (!checkRole.success || !checkRole.data) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          message: "Phân quyền không tồn tại",
          data: null,
          error: {
            message: "Phân quyền không tồn tại",
            errorDetail: "Phân quyền bạn chọn không tồn tại trên hệ thống",
          },
        };
      }
      const user = await this._context.UserRepo.findOne({
        where: {
          id: userId,
        },
      });
      const updatedUser = this._context.UserRepo.merge(user, userData);
      await this._context.UserRepo.save(updatedUser);

      const userUpdated = await this.getUserById(userId);
      if (!userUpdated.success || !userUpdated.data) {
        return {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          success: false,
          message: "Không tìm thấy thông tin người dùng hoặc người dùng đã bị xoá",
          data: null,
          error: {
            message: ErrorMessages.INTERNAL_SERVER_ERROR,
            errorDetail: "Không tìm thấy thông tin người dùng hoặc người dùng đã bị xoá",
          },
        };
      }

      return {
        status: StatusCodes.OK,
        success: true,
        message: null,
        data: userUpdated.data,
        error: null,
      };
    } catch (error: any) {
      logger.error(error?.message);
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

  async deleteUser(userId: string): Promise<IResponseBase> {
    try {
      const user = await this._context.UserRepo.findOne({
        where: {
          id: userId,
          isDeleted: false,
        },
      });
      if (!user) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          message: "Không tìm thấy thông tin người dùng hoặc người dùng đã bị xoá",
          data: null,
          error: {
            message: ErrorMessages.NOT_FOUND,
            errorDetail: "Không tìm thấy thông tin người dùng hoặc người dùng đã bị xoá",
          },
        };
      }
      user.isDeleted = true;
      await this._context.UserRepo.save(user);
      return {
        status: StatusCodes.OK,
        success: true,
        message: null,
        data: {
          message: "Xóa người dùng thành công",
          userId,
        },
        error: null,
      };
    } catch (error: any) {
      logger.error(error?.message);
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

  async restoreUser(userId: string): Promise<IResponseBase> {
    try {
      const user = await this._context.UserRepo.findOne({
        where: {
          id: userId,
          isDeleted: true,
        },
      });
      if (!user) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          message: "Không tìm thấy thông tin người dùng hoặc người dùng đã bị xoá",
          data: null,
          error: {
            message: ErrorMessages.NOT_FOUND,
            errorDetail: "Không tìm thấy thông tin người dùng hoặc người dùng đã bị xoá",
          },
        };
      }
      user.isDeleted = false;
      await this._context.UserRepo.save(user);
      return {
        status: StatusCodes.OK,
        success: true,
        message: null,
        data: {
          message: "Khôi phục người dùng thành công",
          userId,
        },
        error: null,
      };
    } catch (error: any) {
      logger.error(error?.message);
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

  async deletePermanentlyUser(userId: string): Promise<IResponseBase> {
    try {
      const user = await this._context.UserRepo.findOne({
        where: {
          id: userId,
        },
      });
      if (!user) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          message: "Không tìm thấy thông tin người dùng hoặc người dùng đã bị xoá",
          data: null,
          error: {
            message: ErrorMessages.NOT_FOUND,
            errorDetail: "Không tìm thấy thông tin người dùng hoặc người dùng đã bị xoá",
          },
        };
      }
      await this._context.UserRepo.delete(userId);
      return {
        status: StatusCodes.OK,
        success: true,
        message: null,
        data: {
          message: "Xóa người dùng vĩnh viễn thành công",
          userId,
        },
        error: null,
      };
    } catch (error: any) {
      logger.error(error?.message);
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
