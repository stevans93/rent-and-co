import User from "../../models/user";
import { BadRequestError } from "../../utils/errors";
import { ErrorMessages } from "../../utils/messages";
import { comparePassword } from "../../utils/bcrypt";
import { createToken } from "../../utils/jwt";

interface LoginInput {
  email: string;
  password: string;
}

interface SafeUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  role: string;
  profileImage: string;
  active: boolean;
  createdAt?: Date;
}

export const loginService = async (data: LoginInput) => {
  const { email, password } = data;

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new BadRequestError(ErrorMessages.UserNotExists);
  }

  if (user.password) {
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      throw new BadRequestError(ErrorMessages.PasswordNotValid);
    }
  }

  // Create safe user object (without password and sensitive data)
  const safeUser: SafeUser = {
    _id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    city: user.city,
    role: user.role,
    profileImage: user.profileImage,
    active: user.active,
    createdAt: user.createdAt,
  };

  const token = await createToken({
    _id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  });

  return { user: safeUser, token };
};
