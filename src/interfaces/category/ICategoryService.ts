import { IResponseBase } from "../base/IResponseBase";
import { ICategoryRequestData } from "./ICategoryDTO";

export default interface ICategoryService {
  getAllCategories(): Promise<IResponseBase>;
  getCategoryById(id: string): Promise<IResponseBase>;
  getCategoryOfSkill(skillId: string): Promise<IResponseBase>;
  getCategoryOfLevel(levelId: string): Promise<IResponseBase>;
  createNewCategory(dataCreate: ICategoryRequestData): Promise<IResponseBase>;
  updateCategory(id: string, dataUpdate: ICategoryRequestData): Promise<IResponseBase>;
  deleteCategory(id: string): Promise<IResponseBase>;
  restoreCategory(id: string): Promise<IResponseBase>;
  activeCategory(id: string): Promise<IResponseBase>;
  inactiveCategory(id: string): Promise<IResponseBase>;
  deleteCategoryPermanently(id: string): Promise<IResponseBase>;
}
