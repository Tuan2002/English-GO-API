import ISkillService from "@/interfaces/skill/ISkillService";
import SkillService from "@/services/skill/SkillService";
import { Request, Response } from "express";

export class SkillController {
  private _skillService: ISkillService;

  constructor() {
    this._skillService = new SkillService();
  }

  async getAllSkills(req: Request, res: Response) {
    const skills = await this._skillService.getAllSkills();
    return res.status(skills.status).json(skills);
  }

  async getSkillById(req: Request, res: Response) {
    const { skillId } = req.params;
    const skill = await this._skillService.getSkillById(skillId);
    return res.status(skill.status).json(skill);
  }
}
