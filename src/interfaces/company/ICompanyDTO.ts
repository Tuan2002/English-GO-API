export interface IRegisterCompanyDTO {
  id?: string;
  companyName: string;
  taxCode: string;
  companyWebsite?: string;
  companyEmail: string;
  phoneNumber?: string;
  provinceId: string;
  companyAddress: string;
  companyIntroduce?: string;
  companyLogo?: string;
  companyBanner?: string;
  companyDescription?: string;
  userId: string;
  memberCountId: string;
}
