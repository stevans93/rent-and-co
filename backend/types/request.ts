import { Types } from "mongoose";

export interface IRegisterRequest {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  city: string;
  active: boolean;
  language: string;
  role: string;
  pib: string;
  phone: string;
  address: string;
  companyName: string;
  profileImage: string;
  facebook: string;
  instagram: string;
  companyRegistrationNumber: string;
  companyAddress: string;
  socialSecurityNumber: string;
  wishList: Types.ObjectId[];
}
