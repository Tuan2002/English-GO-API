import { Response } from "express";
import { BaseRoute } from "./BaseRoute";
import { Request as ExpressRequest } from "express";
import { QuestionController } from "@/controllers/QuestionController";

class QuestionRoutes extends BaseRoute {
  private _questionController: QuestionController;
  constructor() {
    super();
    this.init();
    this._questionController = new QuestionController();
  }

  init() {
    this.router.post("/create-question", (req: ExpressRequest, res: Response) => {
      this._questionController.createNewQuestion(req, res);
    });
  }
}

export = new QuestionRoutes().router;
