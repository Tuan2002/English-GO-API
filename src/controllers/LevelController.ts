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

  async getLevelOfSkillId(req: Request, res: Response) {
    const { skillId } = req.params;
    const level = await this._levelService.getListLevelOfSkillId(skillId);
    return res.status(level.status).json(level);
  }

  async updateLevel(req: Request, res: Response) {
    const { levelId } = req.params;
    const levelData = req.body;
    const level = await this._levelService.updateLevel(levelId, levelData);
    return res.status(level.status).json(level);
  }
}
