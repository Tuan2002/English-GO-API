import ILevelService from "@/interfaces/level/ILevelService";
import LevelService from "@/services/level/LevelService";
import { Request, Response } from "express";

export class LevelController {
  private _levelService: ILevelService;

  constructor() {
    this._levelService = new LevelService();
  }

  async getAllLevels(req: Request, res: Response) {
    const levels = await this._levelService.getAllLevels();
    return res.status(levels.status).json(levels);
  }

  async getLevelById(req: Request, res: Response) {
    const { levelId } = req.params;
    const level = await this._levelService.getLevelById(levelId);
    return res.status(level.status).json(level);
  }
}
