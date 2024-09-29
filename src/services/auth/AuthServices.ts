import { IUpdateProfilePayload, IUserLoginData, IUserLoginResponse, IUserRegisterData } from "@/interfaces/auth/AuthDto";
import IAuthService from "@/interfaces/auth/IAuthService";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import { Repo } from "@/repository";
import { StatusCodes } from "http-status-codes";
import { IAccessTokenPayload, IJWTService } from "@/interfaces/auth/IJWTService";
import JwtService from "./JWTService";
import IRoleService from "@/interfaces/auth/IRoleService";
import RoleService from "./RoleService";
import { v4 as uuidv4 } from "uuid";
import EGroupRole from "@/constants/GroupRole";
import Extensions from "@/utils/Extensions";

export default class AuthService implements IAuthService {
  private _JwtService!: IJWTService;
  private _RoleService!: IRoleService;
  constructor() {
    this._JwtService = new JwtService();
    this._RoleService = new RoleService();
  }

  async getUserByusername(email: string): Promise<IResponseBase> {
    try {
      if (!email) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          errorMessage: "Email không được để trống",
          data: null,
          error: {
            message: "Bad Request",
            errorDetail: "Email không được để trống",
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
        errorMessage: "Lỗi từ phía server",
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
          errorMessage: "username không được để trống",
          data: null,
          error: {
            message: "Bad Request",
            errorDetail: "username không được để trống",
          },
        };
      }
      const user = await Repo.UserRepo.findOne({
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
    } catch {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        errorMessage: "Lỗi từ phía server",
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
          errorMessage: "Tài khoản và mật khẩu không được để trống",
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
          errorMessage: "Tài khoản của bạn không tồn tại trên hệ thống",
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
          errorMessage: "Mật khẩu không chính xác",
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
          errorMessage: "Tài khoản của bạn đã bị khóa",
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
    } catch {
      return {
        status: 500,
        success: false,
        errorMessage: "Lỗi từ phía server",
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
          errorMessage: "Tài khoản, mật khẩu và họ tên không được để trống",
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
          errorMessage: "Tài khoản đã tồn tại trên hệ thống",
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
          errorMessage: "Đăng kí tài khoản không thành công",
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

      const newUser = await Repo.UserRepo.save(registerData);
      console.log("createUser");

      if (!newUser) {
        return {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          success: false,
          errorMessage: "Đăng kí tài khoản không thành công, vui lòng kiểm tra lại",
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
      console.log(error);
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        errorMessage: "Lỗi từ phía server",
        data: null,
        error: {
          message: "Lỗi từ phía server",
          errorDetail: "Lỗi từ phía server",
        },
      };
    }
  }

  async getMe(userId: string): Promise<IResponseBase> {
    if (!userId) {
      return {
        status: StatusCodes.BAD_REQUEST,
        success: false,
        errorMessage: "Mã người dùng không được để trống",
        data: null,
        error: {
          message: "Bad Request",
          errorDetail: "Mã người dùng không được để trống",
        },
      };
    }
    try {
      const user = await Repo.UserRepo.createQueryBuilder("user")
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
          errorMessage: "Không tìm thấy thông tin người dùng",
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
    } catch {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        errorMessage: "Lỗi từ phía server",
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
          errorMessage: "Mã người dùng không được để trống",
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
          errorMessage: "Họ và tên không được để trống",
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
          errorMessage: "Ngày sinh không được để trống",
          data: null,
          error: {
            message: "Bad Request",
            errorDetail: "Ngày sinh không được để trống",
          },
        };
      }
      const user = await Repo.UserRepo.findOne({
        where: {
          id: userId,
        },
      });
      if (!user) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          errorMessage: "Không tìm thấy thông tin người dùng",
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
          errorMessage: "Tài khoản người dùng không tồn tại hoặc đã bị khoá",
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

      const updatedUser = await Repo.UserRepo.save(user);
      if (!updatedUser) {
        return {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          success: false,
          errorMessage: "Cập nhật thông tin cá nhân thất bại",
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
        data: user,
        error: null,
      };
    } catch (error: any) {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        errorMessage: "Lỗi từ phía server",
        data: null,
        error: {
          message: "Lỗi từ phía server",
          errorDetail: "Lỗi từ phía server",
        },
      };
    }
  }
}
