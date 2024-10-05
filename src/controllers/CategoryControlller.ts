import ICategoryService from "@/interfaces/category/ICategoryService";
import { CategoryService } from "@/services/category/CategoryService";
import { Request, Response } from "express";

export class CategoryController {
  private _categoryService: ICategoryService;

  constructor() {
    this._categoryService = new CategoryService();
  }

  async getAllCategories(req: Request, res: Response) {
    const categories = await this._categoryService.getAllCategories();
    return res.status(categories.status).json(categories);
  }

  async getCategoryById(req: Request, res: Response) {
    const { categoryId } = req.params;
    const category = await this._categoryService.getCategoryById(categoryId);
    return res.status(category.status).json(category);
  }

  async getCategoryOfSkill(req: Request, res: Response) {
    const { skillId } = req.params;
    const category = await this._categoryService.getCategoryOfSkill(skillId);
    return res.status(category.status).json(category);
  }

  async getCategoryOfLevel(req: Request, res: Response) {
    const { levelId } = req.params;
    const category = await this._categoryService.getCategoryOfLevel(levelId);
    return res.status(category.status).json(category);
  }

  async createNewCategory(req: Request, res: Response) {
    const categoryData = req.body;
    const category = await this._categoryService.createNewCategory(categoryData);
    return res.status(category.status).json(category);
  }

  async updateCategory(req: Request, res: Response) {
    const { categoryId } = req.params;
    const categoryData = req.body;
    const category = await this._categoryService.updateCategory(categoryId, categoryData);
    return res.status(category.status).json(category);
  }

  async deleteCategory(req: Request, res: Response) {
    const { categoryId } = req.params;
    const category = await this._categoryService.deleteCategory(categoryId);
    return res.status(category.status).json(category);
  }

  async restoreCategory(req: Request, res: Response) {
    const { categoryId } = req.params;
    const category = await this._categoryService.restoreCategory(categoryId);
    return res.status(category.status).json(category);
  }

  async activeCategory(req: Request, res: Response) {
    const { categoryId } = req.params;
    const category = await this._categoryService.activeCategory(categoryId);
    return res.status(category.status).json(category);
  }

  async inactiveCategory(req: Request, res: Response) {
    const { categoryId } = req.params;
    const category = await this._categoryService.inactiveCategory(categoryId);
    return res.status(category.status).json(category);
  }

  async deleteCategoryPermanently(req: Request, res: Response) {
    const { categoryId } = req.params;
    const category = await this._categoryService.deleteCategoryPermanently(categoryId);
    return res.status(category.status).json(category);
  }
}
