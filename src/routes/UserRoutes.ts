import { Response } from "express";
import { UserController } from "@/controllers/UserController";
import { BaseRoute } from "./BaseRoute";
import { Request as ExpressRequest } from "express";

class UserRoutes extends BaseRoute {
  private _userController: UserController;
  constructor() {
    super();
    this.init();
    this._userController = new UserController();
  }

  init() {
    this.router.get("/get-users", (req: ExpressRequest, res: Response) => {
      this._userController.getAllUser(req, res);
    });
    this.router.get("/get-deleted-users", (req: ExpressRequest, res: Response) => {
      this._userController.getDeletedUsers(req, res);
    });
    this.router.get("/get-user/:userId", (req: ExpressRequest, res: Response) => {
      this._userController.getUserById(req, res);
    });
    this.router.post("/create-user", (req: ExpressRequest, res: Response) => {
      this._userController.createUser(req, res);
    });
    this.router.put("/update-user/:userId", (req: ExpressRequest, res: Response) => {
      this._userController.updateUser(req, res);
    });
    this.router.delete("/delete-user/:userId", (req: ExpressRequest, res: Response) => {
      this._userController.deleteUser(req, res);
    });
    this.router.put("/restore-user/:userId", (req: ExpressRequest, res: Response) => {
      this._userController.restoreUser(req, res);
    });
    this.router.delete("/delete-permanently-user/:userId", (req: ExpressRequest, res: Response) => {
      this._userController.deletePermanentlyUser(req, res);
    });
  }
}

export = new UserRoutes().router;
