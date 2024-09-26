import { ErrorMessages } from "@/constants/ErrorMessages";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import IProvinceService from "@/interfaces/province/IProvinceService";
import { Repo } from "@/repository";
import { StatusCodes } from "http-status-codes";

export class ProvinceService implements IProvinceService {
  constructor() {}
  public async getProvincies(): Promise<IResponseBase> {
    try {
      const province = await Repo.ProvinceRepo.find();
      return {
        status: StatusCodes.OK,
        success: true,
        errorMessage: null,
        data: province,
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
