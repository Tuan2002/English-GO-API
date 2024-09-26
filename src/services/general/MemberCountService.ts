import { ErrorMessages } from "@/constants/ErrorMessages";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import IMemberCountService from "@/interfaces/memberAccount/IMemberCountService";
import { Repo } from "@/repository";
import { StatusCodes } from "http-status-codes";

export class MemberCountService implements IMemberCountService {
  constructor() {}
  public async getAllMemberCounts(): Promise<IResponseBase> {
    try {
      const memberCount = await Repo.MemberCountRepo.find({
        order: {
          id: "ASC",
        },
      });
      return {
        status: StatusCodes.OK,
        success: true,
        errorMessage: null,
        data: memberCount,
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
