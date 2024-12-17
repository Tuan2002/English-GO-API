import ILevelService from "@/interfaces/level/ILevelService";
import AuthenticateMiddleware from "@/middlewares/AuthenticateMiddleware";
import LevelService from "@/services/level/LevelService";
import { before, GET, inject, PUT, route } from "awilix-express";
import { Request, Response } from "express";

@before(inject((JwtService) => AuthenticateMiddleware(JwtService)))
@route("/levels")
export class LevelController {
  private _levelService: ILevelService;

  constructor(LevelService: LevelService) {
    this._levelService = LevelService;
  }
  @GET()
  @route("/get-levels")
  async getAllLevels(req: Request, res: Response) {
    const levels = await this._levelService.getAllLevels();
    return res.status(levels.status).json(levels);
  }

  @GET()
  @route("/get-level/:levelId")
  async getLevelById(req: Request, res: Response) {
    const { levelId } = req.params;
    const level = await this._levelService.getLevelById(levelId);
    return res.status(level.status).json(level);
  }

  @GET()
  @route("/get-level-of-skill/:skillId")
  async getLevelOfSkillId(req: Request, res: Response) {
    const { skillId } = req.params;
    const level = await this._levelService.getListLevelOfSkillId(skillId);
    return res.status(level.status).json(level);
  }

  @PUT()
  @route("/update-level/:levelId")
  async updateLevel(req: Request, res: Response) {
    const { levelId } = req.params;
    const levelData = req.body;
    const level = await this._levelService.updateLevel(levelId, levelData);
    return res.status(level.status).json(level);
  }
}
