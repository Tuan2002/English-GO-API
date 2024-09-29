export interface ICreateUserData {
  email?: string;
  username: string;
  password: string;
  fullName: string;
  avatar?: string;
  groupRoleId: string;
}
export interface IUpdateUserData {
  id: string;
  email?: string;
  fullName?: string;
  avatar?: string;
  phoneNumber?: string;
  birthday?: string;
  gender?: EGenderStatus;
  groupRoleId?: string;
}
export enum EGenderStatus {
  FEMALE = "F",
  MALE = "M",
  OTHER = "O",
}
