import { Router } from "express";

export class BaseRoute {
  private _router = Router();

  get router() {
    return this._router;
  }
}
