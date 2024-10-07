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
    this.router.get("/get-all-questions", (req: ExpressRequest, res: Response) => {
      this._questionController.getAllQuestions(req, res);
    });
    this.router.get("/get-questions-by-category/:categoryId", (req: ExpressRequest, res: Response) => {
      this._questionController.getAllQuestionByCategory(req, res);
    });
    this.router.get("/get-questions-by-skill/:skillId", (req: ExpressRequest, res: Response) => {
      this._questionController.getAllQuestionBySkill(req, res);
    });
    this.router.get("/get-questions-by-level/:levelId", (req: ExpressRequest, res: Response) => {
      this._questionController.getAllQuestionByLevel(req, res);
    });
    this.router.get("/get-question-detail/:questionId", (req: ExpressRequest, res: Response) => {
      this._questionController.getQuestionDetail(req, res);
    });
    this.router.put("/update-question", (req: ExpressRequest, res: Response) => {
      this._questionController.updateQuestion(req, res);
    });
    this.router.delete("/delete-question/:questionId", (req: ExpressRequest, res: Response) => {
      this._questionController.deleteQuestion(req, res);
    });
    this.router.put("/restore-question/:questionId", (req: ExpressRequest, res: Response) => {
      this._questionController.restoreQuestion(req, res);
    });
    this.router.put("/active-question/:questionId", (req: ExpressRequest, res: Response) => {
      this._questionController.activeQuestion(req, res);
    });
    this.router.put("/inactive-question/:questionId", (req: ExpressRequest, res: Response) => {
      this._questionController.inactiveQuestion(req, res);
    });
    this.router.delete("delete-question-permanently/:questionId", (req: ExpressRequest, res: Response) => {
      this._questionController.deleteQuestionPermanently(req, res);
    });
  }
}

export = new QuestionRoutes().router;
