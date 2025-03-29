import { PlanAttribute } from "@/entity/PlanAttribute";

export interface IAddNewPlanAttributeDTO {
  planAttributes: PlanAttribute[];
}

export interface ICreateNewPlanTypeDTO {
  name: string;
  displayName: string;
  description?: string;
  planAttributes: PlanAttribute[];
}

export interface IUpdatePlanTypeDTO {
  name: string;
  displayName: string;
  description?: string;
}

export interface IUpdatePlanAttributeDTO {
  id: string;
  name: string;
  displayName: string;
  note?: string;
  dataType: string;
}

export interface IPlanAttributeDetailDTO {
  planId: string;
  attributeId: string;
  value: string;
  name: string;
  dataType: string;
  displayName: string;
  isDefault: boolean;
  note?: string;
}

export interface ICreateNewPlanDTO {
  planTypeId: string;
  planAttributeDetails: IPlanAttributeDetailDTO[];
}
