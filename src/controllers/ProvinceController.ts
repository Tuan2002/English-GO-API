import IProvinceService from "@/interfaces/province/IProvinceService";
import { ProvinceService } from "@/services/general/ProvinceService";
import { Request, Response } from "express";

export class ProvinceController {
  private _provinceService: IProvinceService;
  constructor() {
    this._provinceService = new ProvinceService();
  }

  public async getProvincies(req: Request, res: Response) {
    const response = await this._provinceService.getProvincies();
    return res.status(response.status).json(response);
  }
}
