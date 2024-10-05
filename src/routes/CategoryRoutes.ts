import { CategoryController } from "@/controllers/CategoryControlller";
import { BaseRoute } from "./BaseRoute";
import { Response } from "express";
import { Request } from "express";
class CategoryRoutes extends BaseRoute {
  private _categoryController: CategoryController;
  constructor() {
    super();
    this._categoryController = new CategoryController();
    this.init();
  }

  init() {
    this.router.get("/get-categories", (req: Request, res: Response) => {
      this._categoryController.getAllCategories(req, res);
    });
    this.router.get("/get-category/:categoryId", (req: Request, res: Response) => {
      this._categoryController.getCategoryById(req, res);
    });
    this.router.get("/get-category-of-skill/:skillId", (req: Request, res: Response) => {
      this._categoryController.getCategoryOfSkill(req, res);
    });
    this.router.get("/get-category-of-level/:levelId", (req: Request, res: Response) => {
      this._categoryController.getCategoryOfLevel(req, res);
    });
    this.router.put("/update-category/:categoryId", (req: Request, res: Response) => {
      this._categoryController.updateCategory(req, res);
    });
    this.router.post("/create-category", (req: Request, res: Response) => {
      this._categoryController.createNewCategory(req, res);
    });
    this.router.delete("/delete-category/:categoryId", (req: Request, res: Response) => {
      this._categoryController.deleteCategory(req, res);
    });
    this.router.put("/restore-category/:categoryId", (req: Request, res: Response) => {
      this._categoryController.restoreCategory(req, res);
    });
    this.router.put("/active-category/:categoryId", (req: Request, res: Response) => {
      this._categoryController.activeCategory(req, res);
    });
    this.router.put("/inactive-category/:categoryId", (req: Request, res: Response) => {
      this._categoryController.inactiveCategory(req, res);
    });
    this.router.delete("/delete-category-permanently/:categoryId", (req: Request, res: Response) => {
      this._categoryController.deleteCategoryPermanently(req, res);
    });
  }
}

export = new CategoryRoutes().router;
