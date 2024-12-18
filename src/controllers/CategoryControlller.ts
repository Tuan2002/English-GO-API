import ICategoryService from "@/interfaces/category/ICategoryService";
import AuthenticateMiddleware from "@/middlewares/AuthenticateMiddleware";
import { before, DELETE, GET, inject, POST, PUT, route } from "awilix-express";
import { Request, Response } from "express";

@before(inject((JwtService) => AuthenticateMiddleware(JwtService)))
@route("/categories")
export class CategoryController {
  private readonly _categoryService: ICategoryService;

  constructor(CategoryService: ICategoryService) {
    this._categoryService = CategoryService;
  }
  @GET()
  @route("/get-categories")
  async getAllCategories(req: Request, res: Response) {
    const categories = await this._categoryService.getAllCategories();
    return res.status(categories.status).json(categories);
  }

  @GET()
  @route("/get-category/:categoryId")
  async getCategoryById(req: Request, res: Response) {
    const { categoryId } = req.params;
    const category = await this._categoryService.getCategoryById(categoryId);
    return res.status(category.status).json(category);
  }

  @GET()
  @route("/get-category-of-skill/:skillId")
  async getCategoryOfSkill(req: Request, res: Response) {
    const { skillId } = req.params;
    const category = await this._categoryService.getCategoryOfSkill(skillId);
    return res.status(category.status).json(category);
  }
  
  @GET()
  @route("/get-category-of-level/:levelId")
  async getCategoryOfLevel(req: Request, res: Response) {
    const { levelId } = req.params;
    const category = await this._categoryService.getCategoryOfLevel(levelId);
    return res.status(category.status).json(category);
  }

  @POST()
  @route("/create-category")
  async createNewCategory(req: Request, res: Response) {
    const categoryData = req.body;
    const category = await this._categoryService.createNewCategory(categoryData);
    return res.status(category.status).json(category);
  }

  @PUT()
  @route("/update-category/:categoryId")
  async updateCategory(req: Request, res: Response) {
    const { categoryId } = req.params;
    const categoryData = req.body;
    const category = await this._categoryService.updateCategory(categoryId, categoryData);
    return res.status(category.status).json(category);
  }

  @DELETE()
  @route("/delete-category/:categoryId")
  async deleteCategory(req: Request, res: Response) {
    const { categoryId } = req.params;
    const category = await this._categoryService.deleteCategory(categoryId);
    return res.status(category.status).json(category);
  }

  @PUT()
  @route("/restore-category/:categoryId")
  async restoreCategory(req: Request, res: Response) {
    const { categoryId } = req.params;
    const category = await this._categoryService.restoreCategory(categoryId);
    return res.status(category.status).json(category);
  }

  @PUT()
  @route("/active-category/:categoryId")
  async activeCategory(req: Request, res: Response) {
    const { categoryId } = req.params;
    const category = await this._categoryService.activeCategory(categoryId);
    return res.status(category.status).json(category);
  }
  
  @PUT()
  @route("/inactive-category/:categoryId")
  async inactiveCategory(req: Request, res: Response) {
    const { categoryId } = req.params;
    const category = await this._categoryService.inactiveCategory(categoryId);
    return res.status(category.status).json(category);
  }

  @DELETE()
  @route("/delete-category-permanently/:categoryId")
  async deleteCategoryPermanently(req: Request, res: Response) {
    const { categoryId } = req.params;
    const category = await this._categoryService.deleteCategoryPermanently(categoryId);
    return res.status(category.status).json(category);
  }
}
