import ISkillService from "@/interfaces/skill/ISkillService";
import AuthenticateMiddleware from "@/middlewares/AuthenticateMiddleware";
import SkillService from "@/services/skill/SkillService";
import { before, GET, inject, PUT, route } from "awilix-express";
import { Request, Response } from "express";


@before(inject((JwtService) => AuthenticateMiddleware(JwtService)))
@route("/skills")
export class SkillController {
  private _skillService: ISkillService;

  constructor(SkillService: SkillService) {
    this._skillService = SkillService;
  }

  @GET()
  @route("/get-skills")
  async getAllSkills(req: Request, res: Response) {
    const skills = await this._skillService.getAllSkills();
    return res.status(skills.status).json(skills);
  }

  @GET()
  @route("/get-skill/:skillId")
  async getSkillById(req: Request, res: Response) {
    const { skillId } = req.params;
    const skill = await this._skillService.getSkillById(skillId);
    return res.status(skill.status).json(skill);
  }

  @PUT()
  @route("/update-skill/:skillId")
  async updateSkill(req: Request, res: Response) {
    const { skillId } = req.params;
    const skillData = req.body;
    const skill = await this._skillService.updateSkill(skillId, skillData);
    return res.status(skill.status).json(skill);
  }
}
