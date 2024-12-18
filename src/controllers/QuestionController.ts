import IQuestionService from "@/interfaces/question/IQuestionService";
import AuthenticateMiddleware from "@/middlewares/AuthenticateMiddleware";
import QuestionService from "@/services/question/QuestionService";
import { before, DELETE, GET, inject, POST, PUT, route } from "awilix-express";
import { Request, Response } from "express";


@before(inject((JwtService) => AuthenticateMiddleware(JwtService)))
@route("/questions")
export class QuestionController {
  private _questionService: IQuestionService;

  constructor(QuestionService: QuestionService) {
    this._questionService = QuestionService;
  }

  @POST()
  @route("/create-question")
  async createNewQuestion(req: Request, res: Response) {
    const questionData = req.body;
    const { id } = req.user;
    const question = await this._questionService.createNewQuestion(questionData, id);
    return res.status(question.status).json(question);
  }

  @GET()
  @route("/get-all-questions")
  async getAllQuestions(req: Request, res: Response) {
    const questions = await this._questionService.getAllQuestions();
    return res.status(questions.status).json(questions);
  }

  @GET()
  @route("/get-questions-by-category/:categoryId")
  async getAllQuestionByCategory(req: Request, res: Response) {
    const { categoryId } = req.params;
    const { status } = req.query;
    const isActive = status === "active" ? true : status === "inactive" ? false : undefined;
    const questions = await this._questionService.getAllQuestionByCategoryId(categoryId, isActive);
    return res.status(questions.status).json(questions);
  }

  @GET()
  @route("/get-questions-by-skill/:skillId")
  async getAllQuestionBySkill(req: Request, res: Response) {
    const { skillId } = req.params;
    const questions = await this._questionService.getAllQuestionBySkillId(skillId);
    return res.status(questions.status).json(questions);
  }

  @GET()
  @route("/get-questions-by-level/:levelId")
  async getAllQuestionByLevel(req: Request, res: Response) {
    const { levelId } = req.params;
    const questions = await this._questionService.getAllQuestionByLevelId(levelId);
    return res.status(questions.status).json(questions);
  }

  @GET()
  @route("/get-question-detail/:questionId")
  async getQuestionDetail(req: Request, res: Response) {
    const { questionId } = req.params;
    const question = await this._questionService.getQuestionDetail(questionId);
    return res.status(question.status).json(question);
  }

  @PUT()
  @route("/update-question/:questionId")
  async updateQuestion(req: Request, res: Response) {
    const questionData = req.body;
    const { id } = req.user;
    const question = await this._questionService.updateQuestion(questionData, id);
    return res.status(question.status).json(question);
  }

  @DELETE()
  @route("/delete-question/:questionId")
  async deleteQuestion(req: Request, res: Response) {
    const { questionId } = req.params;
    const question = await this._questionService.deleteQuestion(questionId);
    return res.status(question.status).json(question);
  }

  @PUT()
  @route("/restore-question/:questionId")
  async restoreQuestion(req: Request, res: Response) {
    const { questionId } = req.params;
    const question = await this._questionService.restoreQuestion(questionId);
    return res.status(question.status).json(question);
  }

  @PUT()
  @route("/active-question/:questionId")
  async activeQuestion(req: Request, res: Response) {
    const { questionId } = req.params;
    const question = await this._questionService.activeQuestion(questionId);
    return res.status(question.status).json(question);
  }

  @PUT()
  @route("/inactive-question/:questionId")
  async inactiveQuestion(req: Request, res: Response) {
    const { questionId } = req.params;
    const question = await this._questionService.inactiveQuestion(questionId);
    return res.status(question.status).json(question);
  }

  @DELETE()
  @route("/delete-question-permanently/:questionId")
  async deleteQuestionPermanently(req: Request, res: Response) {
    const { questionId } = req.params;
    const question = await this._questionService.deleteQuestionPermanently(questionId);
    return res.status(question.status).json(question);
  }
}
