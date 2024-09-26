import { ENV } from "@/constants/env";
import bcrypt from "bcrypt";
const hashPassword = (plaintextPassword: string): string => {
  const salt = bcrypt.genSaltSync(Number(ENV.PASSWORD_SALT));
  const hash = bcrypt.hashSync(plaintextPassword, salt);
  return hash;
};
const comparePassword = async (plaintextPassword: string, hashPassword: string): Promise<boolean> => {
  const checkPassword = bcrypt.compareSync(plaintextPassword, hashPassword);
  return checkPassword;
};

const Extensions = {
  hashPassword,
  comparePassword,
};
export default Extensions;
