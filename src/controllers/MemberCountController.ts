import IMemberCountService from "@/interfaces/memberAccount/IMemberCountService";
import { MemberCountService } from "@/services/general/MemberCountService";
import { Request, Response } from "express";

export class MemberCountController {
  private _memberCountService: IMemberCountService;
  constructor() {
    this._memberCountService = new MemberCountService();
  }

  public async getAllMemberCounts(req: Request, res: Response) {
    const response = await this._memberCountService.getAllMemberCounts();
    return res.status(response.status).json(response);
  }
}
