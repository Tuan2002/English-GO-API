import EGroupRole from "@/constants/GroupRole";
import { LocalStorage } from "@/constants/LocalStorage";
import { ENV } from "@/constants/env";
import { IUpdateProfilePayload, IUserLoginData, IUserLoginResponse, IUserRegisterData } from "@/interfaces/auth/AuthDto";
import IAuthService from "@/interfaces/auth/IAuthService";
import { IAccessTokenPayload, IJWTService } from "@/interfaces/auth/IJWTService";
import IRoleService from "@/interfaces/auth/IRoleService";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import { EGenderStatus } from "@/interfaces/user/UserDTO";
import { RequestStorage } from "@/middlewares/AsyncLocalStorage";
import Extensions from "@/utils/Extensions";
import axios from "axios";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";
import DatabaseService from "../database/DatabaseService";
import logger from "@/helpers/logger";

export default class AuthService implements IAuthService {
  private readonly _JwtService!: IJWTService;
  private readonly _RoleService!: IRoleService;
  private readonly _context: DatabaseService;

  constructor(JwtService: IJWTService, RoleService: IRoleService, DatabaseService: DatabaseService) {
    this._JwtService = JwtService;
    this._RoleService = RoleService;
    this._context = DatabaseService;
  }

  async getUserByusername(email: string): Promise<IResponseBase> {
    try {
      if (!email) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          message: "Email không được để trống",
          data: null,
          error: {
            message: "Bad Request",
            errorDetail: "Email không được để trống",
          },
        };
      }
      const user = await this._context.UserRepo.findOne({
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
    } catch (error) {
      logger.error(error?.message);
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Lỗi từ phía server",
        data: null,
        error: {
          message: "Lỗi từ phía server",
          errorDetail: "Lỗi từ phía server",
        },
      };
    }
  }

  async getUserByUsername(username: string): Promise<IResponseBase> {
    try {
      if (!username) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          message: "username không được để trống",
          data: null,
          error: {
            message: "Bad Request",
            errorDetail: "username không được để trống",
          },
        };
      }
      const user = await this._context.UserRepo.findOne({
        where: {
          username,
        },
        relations: ["groupRole"],
      });
      return {
        status: StatusCodes.OK,
        success: true,
        data: user,
        error: null,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Lỗi từ phía server",
        data: null,
        error: {
          message: "Lỗi từ phía server",
          errorDetail: "Lỗi từ phía server",
        },
      };
    }
  }

  async login(userLogin: IUserLoginData, setAccessTokenToCookie: (data: string) => void): Promise<IResponseBase> {
    try {
      if (!userLogin.username || !userLogin.password) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          message: "Tài khoản và mật khẩu không được để trống",
          data: null,
          error: {
            message: "Bad Request",
            errorDetail: "Tài khoản và mật khẩu không được để trống",
          },
        };
      }
      const user = await this.getUserByUsername(userLogin.username);
      if (!user.success || user.data === null || user.data.isDeleted) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          message: "Tài khoản của bạn không tồn tại trên hệ thống",
          data: null,
          error: {
            message: "Not Found",
            errorDetail: "Tài khoản của bạn không tồn tại trên hệ thống",
          },
        };
      }
      const checkPass = await Extensions.comparePassword(userLogin.password, user.data.password);
      if (!checkPass) {
        return {
          status: StatusCodes.UNAUTHORIZED,
          success: false,
          message: "Mật khẩu không chính xác",
          data: null,
          error: {
            message: "Unauthorized",
            errorDetail: "Mật khẩu không chính xác",
          },
        };
      }

      if (user.data.isBlocked) {
        return {
          status: StatusCodes.FORBIDDEN,
          success: false,
          message: "Tài khoản của bạn đã bị khóa",
          data: null,
          error: {
            message: "Forbidden",
            errorDetail: "Tài khoản của bạn đã bị khóa",
          },
        };
      }

      const userRoles = await this._RoleService.getCurrentUserPermission(user.data.groupRoleId);

      if (!userRoles.success) {
        return userRoles;
      }

      const tokenPayload: IAccessTokenPayload = {
        userId: user.data.id,
        username: user.data.username,
        role: userRoles.data,
        roleName: user.data.groupRole.name,
      };

      const token = this._JwtService.generateAccessToken(tokenPayload);
      setAccessTokenToCookie(token.token);
      const loginData: IUserLoginResponse = {
        accessToken: token,
        userInfo: {
          userId: user.data.id,
          username: user.data.username,
          fullName: user.data.fullName,
          role: {
            roleName: user.data.groupRole.name,
            displayName: user.data.groupRole.displayName,
          },
        },
        permissions: userRoles.data,
      };

      return {
        status: 200,
        success: true,
        data: loginData,
        error: null,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        status: 500,
        success: false,
        message: "Lỗi từ phía server",
        data: null,
        error: {
          message: "Lỗi từ phía server",
          errorDetail: "Lỗi từ phía server",
        },
      };
    }
  }

  async checkUserExist(): Promise<IResponseBase> {
    try {
      const request = RequestStorage.getStore()?.get(LocalStorage.REQUEST_STORE);
      const userId = request?.user.id;
      console.log("ID ", userId);
      const isExist = await this._context.UserRepo.exists({
        where: {
          id: userId,
        },
      });
      return {
        status: StatusCodes.OK,
        success: isExist,
        data: isExist,
        error: null,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Lỗi từ phía server",
        data: null,
        error: {
          message: "Lỗi từ phía server",
          errorDetail: "Lỗi từ phía server",
        },
      };
    }
  }

  async registerUserSSO(): Promise<IResponseBase> {
    try {
      const request = RequestStorage.getStore()?.get(LocalStorage.REQUEST_STORE);
      const userId = request?.user.id;
      if (!userId) {
        return {
          status: StatusCodes.UNAUTHORIZED,
          success: false,
          message: "Bạn không có quyền truy cập",
          data: null,
          error: {
            message: "Unauthorized",
            errorDetail: "Bạn không có quyền truy cập",
          },
        };
      }
      const user = await this._context.UserRepo.findOne({
        where: {
          id: userId,
        },
      });
      if (user) {
        return {
          status: StatusCodes.OK,
          success: false,
          message: "Tài khoản đã tồn tại trên hệ thống",
          data: null,
        };
      }
      const accessToken = request?.user.accessToken;
      const response = await axios.get(`${ENV.VINHUNI_API_URL}/gwsg/organizationmanagement/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.data.success === false) {
        return {
          status: StatusCodes.UNAUTHORIZED,
          success: false,
          message: "Không thể xác thực người dùng",
          data: null,
          error: {
            message: "Unauthorized",
            errorDetail: "Không thể xác thực người dùng",
          },
        };
      }

      const userData = response.data.data;
      const date = new Date(userData.dob ?? new Date());
      const formattedDate = date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const registerData = {
        id: userId,
        username: userData.userName,
        password: Extensions.hashPassword("123123"),
        fullName: userData.fullName,
        groupRoleId: EGroupRole.CONTESTANT,
        gender: userData.gender === 1 ? EGenderStatus.MALE : EGenderStatus.FEMALE,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        birthday: formattedDate,
        isExternal: true,
      };
      const newUser = await this._context.UserRepo.save(registerData);
      return {
        status: StatusCodes.CREATED,
        success: true,
        data: newUser,
        error: null,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Lỗi từ phía server",
        data: null,
        error: {
          message: "Lỗi từ phía server",
          errorDetail: "Lỗi từ phía server",
        },
      };
    }
  }

  async register(userRegister: IUserRegisterData): Promise<IResponseBase> {
    try {
      if (!userRegister.username || !userRegister.password || !userRegister.fullName) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          message: "Tài khoản, mật khẩu và họ tên không được để trống",
          data: null,
          error: {
            message: "Bad Request",
            errorDetail: "Tài khoản, mật khẩu và họ tên không được để trống",
          },
        };
      }

      const checkUsernameIsExists = await this.getUserByUsername(userRegister.username);
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

      const checkRole = await this._RoleService.getGroupRole(EGroupRole.CONTESTANT);
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

      const hashPassword = Extensions.hashPassword(userRegister.password);

      const registerData = {
        id: uuidv4(),
        username: userRegister.username,
        password: hashPassword,
        fullName: userRegister.fullName,
        groupRoleId: EGroupRole.CONTESTANT,
      };

      const newUser = await this._context.UserRepo.save(registerData);
      console.log("createUser");

      if (!newUser) {
        return {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          success: false,
          message: "Đăng kí tài khoản không thành công, vui lòng kiểm tra lại",
          data: null,
          error: {
            message: "Đăng kí tài khoản thất bại",
            errorDetail: "Đăng kí tài khoản không thành công, vui lòng kiểm tra lại",
          },
        };
      }

      return {
        status: StatusCodes.CREATED,
        success: true,
        data: {
          username: newUser.username,
          fullName: newUser.fullName,
          id: newUser.id,
          role: newUser.groupRole,
        },
        error: null,
      };
    } catch (error: any) {
      logger.error(error?.message);
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Lỗi từ phía server",
        data: null,
        error: {
          message: "Lỗi từ phía server",
          errorDetail: "Lỗi từ phía server",
        },
      };
    }
  }

  async getMe(): Promise<IResponseBase> {
    try {
      const request = RequestStorage.getStore()?.get(LocalStorage.REQUEST_STORE);
      const userId = request?.user.id;
      if (!userId) {
        return {
          status: StatusCodes.UNAUTHORIZED,
          success: false,
          message: "Bạn không có quyền truy cập",
          data: null,
          error: {
            message: "Unauthorized",
            errorDetail: "Bạn không có quyền truy cập",
          },
        };
      }
      const user = await this._context.UserRepo.createQueryBuilder("user")
        .innerJoin("user.groupRole", "groupRole")
        .where("user.id = :userId", { userId })
        .select(["user", "groupRole.name", "groupRole.displayName"])
        .getOne();

      delete user?.password;
      delete user?.isDeleted;
      delete user?.updatedAt;
      delete user?.createdAt;
      if (!user) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          message: "Không tìm thấy thông tin người dùng",
          data: null,
          error: {
            message: "Không tìm thấy thông tin người dùng",
            errorDetail: "Không tìm thấy thông tin người dùng",
          },
        };
      }
      return {
        status: StatusCodes.OK,
        success: true,
        data: user,
        error: null,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Lỗi từ phía server",
        data: null,
        error: {
          message: "Lỗi từ phía server",
          errorDetail: "Lỗi từ phía server",
        },
      };
    }
  }

  async updateMyProfile(userId: string, data: IUpdateProfilePayload): Promise<IResponseBase> {
    try {
      if (!userId) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          message: "Mã người dùng không được để trống",
          data: null,
          error: {
            message: "Bad Request",
            errorDetail: "Mã người dùng không được để trống",
          },
        };
      }
      if (!data.fullName) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          message: "Họ và tên không được để trống",
          data: null,
          error: {
            message: "Bad Request",
            errorDetail: "Họ và tên không được để trống",
          },
        };
      }
      if (!data.birthday) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          message: "Ngày sinh không được để trống",
          data: null,
          error: {
            message: "Bad Request",
            errorDetail: "Ngày sinh không được để trống",
          },
        };
      }
      const user = await this._context.UserRepo.findOne({
        where: {
          id: userId,
        },
      });
      if (!user) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          message: "Không tìm thấy thông tin người dùng",
          data: null,
          error: {
            message: "Not Found",
            errorDetail: "Không tìm thấy thông tin người dùng",
          },
        };
      }
      if (user.isDeleted || user.isBlocked) {
        return {
          status: StatusCodes.FORBIDDEN,
          success: false,
          message: "Tài khoản người dùng không tồn tại hoặc đã bị khoá",
          data: null,
          error: {
            message: "Forbidden",
            errorDetail: "Tài khoản người dùng không tồn tại hoặc đã bị khoá",
          },
        };
      }
      user.fullName = data.fullName;
      user.email = data.email;
      user.birthday = data.birthday;
      user.avatar = data.avatar;
      user.gender = data.gerder;
      user.phoneNumber = data.phoneNumber;
      user.isUpdated = true;

      const updatedUser = await this._context.UserRepo.save(user);
      if (!updatedUser) {
        return {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          success: false,
          message: "Cập nhật thông tin cá nhân thất bại",
          data: null,
          error: {
            message: "Lỗi từ phía server",
            errorDetail: "Cập nhật thông tin cá nhân thất bại",
          },
        };
      }
      return {
        status: StatusCodes.OK,
        success: true,
        message: "Cập nhật thông tin cá nhân thành công",
        data: user,
        error: null,
      };
    } catch (error: any) {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Lỗi từ phía server",
        data: null,
        error: {
          message: "Lỗi từ phía server",
          errorDetail: "Lỗi từ phía server",
        },
      };
    }
  }
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<IResponseBase> {
    try {
      if (!userId) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          message: "Mã người dùng không được để trống",
          data: null,
          error: {
            message: "Bad Request",
            errorDetail: "Mã người dùng không được để trống",
          },
        };
      }
      if (!oldPassword) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          message: "Mật khẩu cũ không được để trống",
          data: null,
          error: {
            message: "Bad Request",
            errorDetail: "Mật khẩu cũ không được để trống",
          },
        };
      }
      if (!newPassword) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          message: "Mật khẩu mới không được để trống",
          data: null,
          error: {
            message: "Bad Request",
            errorDetail: "Mật khẩu mới không được để trống",
          },
        };
      }
      const user = await this._context.UserRepo.findOne({
        where: {
          id: userId,
        },
      });
      if (!user) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          message: "Không tìm thấy thông tin người dùng",
          data: null,
          error: {
            message: "Not Found",
            errorDetail: "Không tìm thấy thông tin người dùng",
          },
        };
      }
      if (user.isDeleted || user.isBlocked) {
        return {
          status: StatusCodes.FORBIDDEN,
          success: false,
          message: "Tài khoản người dùng không tồn tại hoặc đã bị khoá",
          data: null,
          error: {
            message: "Forbidden",
            errorDetail: "Tài khoản người dùng không tồn tại hoặc đã bị khoá",
          },
        };
      }
      const checkPass = await Extensions.comparePassword(oldPassword, user.password);
      if (!checkPass) {
        return {
          status: StatusCodes.UNAUTHORIZED,
          success: false,
          message: "Mật khẩu cũ không chính xác",
          data: null,
          error: {
            message: "Unauthorized",
            errorDetail: "Mật khẩu cũ không chính xác",
          },
        };
      }
      user.password = Extensions.hashPassword(newPassword);
      user.isUpdated = true;
      const updatedUser = await this._context.UserRepo.save(user);
      if (!updatedUser) {
        return {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          success: false,
          message: "Cập nhật mật khẩu thất bại",
          data: null,
          error: {
            message: "Lỗi từ phía server",
            errorDetail: "Cập nhật mật khẩu thất bại",
          },
        };
      }
      return {
        status: StatusCodes.OK,
        success: true,
        message: "Cập nhật mật khẩu thành công",
        data: user,
        error: null,
      };
    } catch (error: any) {
      logger.error(error?.message);
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Lỗi từ phía server",
        data: null,
        error: {
          message: "Lỗi từ phía server",
          errorDetail: "Lỗi từ phía server",
        },
      };
    }
  }
}
