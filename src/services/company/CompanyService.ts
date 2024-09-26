import CompanyStatus from "@/constants/CompanyStatus";
import { ErrorMessages } from "@/constants/ErrorMessages";
import EGroupRole from "@/constants/GroupRole";
import { Company } from "@/entity/Company";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import { IRegisterCompanyDTO } from "@/interfaces/company/ICompanyDTO";
import ICompanyService from "@/interfaces/company/ICompanyService";
import { Repo } from "@/repository";
import { StatusCodes } from "http-status-codes";
import { Brackets, ILike } from "typeorm";
import { v4 as uuidv4 } from "uuid";

export class CompanyService implements ICompanyService {
  constructor() {}
  public async getAllCompany(page: number = 1, limit: number = 10, search: string = ""): Promise<IResponseBase> {
    try {
      const getTotalCompanyQuery = await Repo.CompanyRepo.count({
        where: {
          companyName: ILike(`%${search}%`),
        },
      });
      const getListCompanyQuery = await Repo.CompanyRepo.createQueryBuilder("company")
        .innerJoinAndSelect("company.recruiter", "recruiter")
        .innerJoinAndSelect("company.memberCount", "memberCount")
        .innerJoinAndSelect("company.province", "province")
        .where("company.isDeleted = false")
        .andWhere("company.companyName ILIKE :companyName", { companyName: `%${search}%` })
        .select([
          "company.id",
          "company.companyName",
          "company.taxCode",
          "company.companyEmail",
          "company.companyWebsite",
          "company.companyDescription",
          "company.companyLogo",
          "company.companyBanner",
          "company.status",
          "company.createdAt",
          "company.isDeleted",
          "company.isActive",
          "recruiter.id",
          "recruiter.email",
          "recruiter.fullName",
          "recruiter.avatar",
          "recruiter.groupRoleId",
          "memberCount.id",
          "memberCount.displayName",
          "province.id",
          "province.provinceName",
        ])
        .orderBy("company.status", "ASC")
        .addOrderBy("company.createdAt", "DESC")
        .skip(Number((page - 1) * limit))
        .take(limit)
        .getMany();

      const [totalItem, companies] = await Promise.all([getTotalCompanyQuery, getListCompanyQuery]);
      return {
        status: StatusCodes.OK,
        success: true,
        errorMessage: null,
        data: {
          companies,
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
  public async getCompanyById(companyId: string): Promise<IResponseBase> {
    try {
      if (!companyId) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          errorMessage: "CompanyId is required",
          data: null,
          error: {
            message: "CompanyId is required",
            errorDetail: "CompanyId is required",
          },
        };
      }
      const company = await Repo.CompanyRepo.createQueryBuilder("company")
        .innerJoinAndSelect("company.recruiter", "recruiter")
        .innerJoinAndSelect("company.memberCount", "memberCount")
        .innerJoinAndSelect("company.province", "province")
        .where("company.id = :companyId", { companyId })
        .select([
          "company",
          "recruiter.id",
          "recruiter.email",
          "recruiter.fullName",
          "recruiter.avatar",
          "recruiter.groupRoleId",
          "memberCount.id",
          "memberCount.displayName",
          "province.id",
          "province.provinceName",
        ])
        .getOne();
      if (!company) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          errorMessage: "Không tìm thấy thông tin công ty",
          data: null,
          error: {
            message: "Không tìm thấy thông tin công ty",
            errorDetail: "Không tìm thấy thông tin công ty",
          },
        };
      }
      return {
        status: StatusCodes.OK,
        success: true,
        errorMessage: null,
        data: company,
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
  public async getCompanyByUserId(userId: string): Promise<IResponseBase> {
    try {
      if (!userId) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          errorMessage: "UserId is required",
          data: null,
          error: {
            message: "UserId is required",
            errorDetail: "UserId is required",
          },
        };
      }
      const company = await Repo.CompanyRepo.createQueryBuilder("company")
        .innerJoinAndSelect("company.recruiter", "recruiter")
        .innerJoinAndSelect("company.memberCount", "memberCount")
        .innerJoinAndSelect("company.province", "province")
        .where("company.recruiterId = :userId", { userId })
        .select([
          "company",
          "recruiter.id",
          "recruiter.email",
          "recruiter.fullName",
          "recruiter.avatar",
          "recruiter.groupRoleId",
          "memberCount.id",
          "memberCount.displayName",
          "province.id",
          "province.provinceName",
        ])
        .getOne();
      if (!company) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          errorMessage: "Không tìm thấy thông tin công ty",
          data: null,
          error: {
            message: "Không tìm thấy thông tin công ty",
            errorDetail: "Không tìm thấy thông tin công ty",
          },
        };
      }
      return {
        status: StatusCodes.OK,
        success: true,
        errorMessage: null,
        data: company,
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
  public async registerCompanyByRecruitment(data: IRegisterCompanyDTO): Promise<IResponseBase> {
    try {
      if (!data.userId) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          errorMessage: "UserId is required",
          data: null,
          error: {
            message: "UserId is required",
            errorDetail: "userId is required",
          },
        };
      }

      // check if provinceId is valid
      // check if memberCountId is valid
      // check if recruiterId is valid
      // check if recruiter already registered company
      const checkUserRegistered = await this.getCompanyByUserId(data.userId);
      if (checkUserRegistered.success || checkUserRegistered.data !== null) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          errorMessage: "Người dùng đã đăng ký thông tin công ty",
          data: null,
          error: {
            message: "Người dùng đã đăng ký thông tin công ty",
            errorDetail: "Người dùng đã đăng ký thông tin công ty",
          },
        };
      }

      // add company and save to database
      const company = new Company();
      company.companyName = data.companyName;
      company.taxCode = data.taxCode;
      company.companyWebsite = data.companyWebsite;
      company.companyEmail = data.companyEmail;
      company.phoneNumber = data.phoneNumber;
      company.provinceId = data.provinceId;
      company.companyAddress = data.companyAddress;
      company.companyIntroduce = data.companyIntroduce;
      company.companyLogo = data.companyLogo;
      company.companyBanner = data.companyBanner;
      company.recruiterId = data.userId;
      company.memberCountId = data.memberCountId;
      company.companyDescription = data.companyDescription;
      company.id = uuidv4();

      const companyRepo = Repo.CompanyRepo.create(company);
      const result = await Repo.CompanyRepo.save(companyRepo);

      if (!result) {
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

      return {
        status: StatusCodes.CREATED,
        success: true,
        errorMessage: null,
        data: result,
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
  public async updateCompanyWhenRegister(data: IRegisterCompanyDTO): Promise<IResponseBase> {
    try {
      if (!data.id) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          errorMessage: "CompanyId is required",
          data: null,
          error: {
            message: "CompanyId is required",
            errorDetail: "CompanyId is required",
          },
        };
      }
      const companyResponse = await this.getCompanyById(data.id);

      if (!companyResponse || !companyResponse.success || companyResponse.data === null) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          errorMessage: "Không tìm thấy thông tin công ty",
          data: null,
          error: {
            message: "Không tìm thấy thông tin công ty",
            errorDetail: "Không tìm thấy thông tin công ty",
          },
        };
      }
      const company = companyResponse.data;

      company.companyName = data.companyName;
      company.taxCode = data.taxCode;
      company.companyWebsite = data.companyWebsite;
      company.companyEmail = data.companyEmail;
      company.phoneNumber = data.phoneNumber;
      company.provinceId = data.provinceId;
      company.companyAddress = data.companyAddress;
      company.companyIntroduce = data.companyIntroduce;
      company.companyLogo = data.companyLogo;
      company.companyBanner = data.companyBanner;
      company.companyDescription = data.companyDescription;
      company.memberCountId = data.memberCountId;
      company.status = 0;
      company.feedbackFromManager = null;

      const result = await Repo.CompanyRepo.update(company.id, company);
      if (!result) {
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

      return {
        status: StatusCodes.OK,
        success: true,
        errorMessage: null,
        data: company,
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
  public async approveRegisterCompany(companyId: string): Promise<IResponseBase> {
    try {
      if (!companyId) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          errorMessage: "CompanyId is required",
          data: null,
          error: {
            message: "CompanyId is required",
            errorDetail: "CompanyId is required",
          },
        };
      }
      const companyResponse = await this.getCompanyById(companyId);

      if (!companyResponse || !companyResponse.success || companyResponse.data === null) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          errorMessage: "Không tìm thấy thông tin công ty",
          data: null,
          error: {
            message: "Không tìm thấy thông tin công ty",
            errorDetail: "Không tìm thấy thông tin công ty",
          },
        };
      }
      const company = companyResponse.data;
      if (company.status !== CompanyStatus.PENDING) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          errorMessage: "Công ty đã được duyệt hoặc đã bị từ chối",
          data: null,
          error: {
            message: "Công ty đã được duyệt hoặc đã bị từ chối",
            errorDetail: "Công ty đã được duyệt hoặc đã bị từ chối",
          },
        };
      }
      const updateCompanyQuery = await Repo.CompanyRepo.update(companyId, {
        status: CompanyStatus.APPROVE,
      });
      let userRole = EGroupRole.CANDIDATE;

      if (company.recruiter.groupRoleId === EGroupRole.CANDIDATE) {
        // update user role to recruiter if user is candidate
        // if user is admin or manager, do nothing
        userRole = EGroupRole.RECRUITER;
      }
      const updateUserQuery = await Repo.UserRepo.update(companyResponse.data.recruiter.id, {
        groupRoleId: userRole,
      });
      const [updateCompany, updateUser] = await Promise.all([updateCompanyQuery, updateUserQuery]);

      if (!updateCompany || !updateUser) {
        return {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          success: false,
          errorMessage: "duyệt đăng kí công ty không thành công",
          data: null,
          error: {
            message: "duyệt đăng kí công ty không thành công",
            errorDetail: "duyệt đăng kí công ty không thành công",
          },
        };
      }

      company.status = CompanyStatus.APPROVE;
      company.recruiter.groupRoleId = userRole;
      return {
        status: StatusCodes.OK,
        success: true,
        errorMessage: null,
        data: company,
        error: null,
      };
    } catch (error) {
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
  public async rejectRegisterCompany(companyId: string, reason: string): Promise<IResponseBase> {
    try {
      if (!companyId) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          errorMessage: "CompanyId is required",
          data: null,
          error: {
            message: "CompanyId is required",
            errorDetail: "CompanyId is required",
          },
        };
      }
      if (!reason) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          errorMessage: "Lý do từ chối bắt buộc phải nhập",
          data: null,
          error: {
            message: "Lý do từ chối bắt buộc phải nhập",
            errorDetail: "lý do từ chối bắt buộc phải nhập",
          },
        };
      }
      const companyResponse = await this.getCompanyById(companyId);

      if (!companyResponse || !companyResponse.success || companyResponse.data === null) {
        return {
          status: StatusCodes.NOT_FOUND,
          success: false,
          errorMessage: "Không tìm thấy thông tin công ty",
          data: null,
          error: {
            message: "Không tìm thấy thông tin công ty",
            errorDetail: "Không tìm thấy thông tin công ty",
          },
        };
      }

      const company = companyResponse.data;
      if (company.status !== CompanyStatus.PENDING) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          errorMessage: "Công ty này đã được xác nhận duyệt hoặc đã bị từ chối",
          data: null,
          error: {
            message: "Công ty này đã được xác nhận duyệt hoặc đã bị từ chối",
            errorDetail: "Công ty này đã được xác nhận duyệt hoặc đã bị từ chối",
          },
        };
      }
      const updateCompany = await Repo.CompanyRepo.update(companyId, {
        status: 2,
        feedbackFromManager: reason,
      });
      if (!updateCompany) {
        return {
          status: StatusCodes.BAD_REQUEST,
          success: false,
          errorMessage: "Từ chối đăng kí công ty không thành công!",
          data: null,
          error: {
            message: "Từ chối đăng kí công ty không thành công!",
            errorDetail: "Từ chối đăng kí công ty không thành công!",
          },
        };
      }
      company.status = CompanyStatus.REJECT;
      return {
        status: StatusCodes.OK,
        success: true,
        errorMessage: null,
        data: company,
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
