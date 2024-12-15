interface IError {
  message: string;
  errorDetail?: string;
}
export interface IResponseBase {
  status: number;
  success: boolean;
  message?: string;
  data: any;
  error?: IError | null;
}
