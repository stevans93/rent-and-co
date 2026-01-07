import User from "../../models/user";
import { hashPassword } from "../../utils/bcrypt";
import { createToken } from "../../utils/jwt";
import { BadRequestError } from "../../utils/errors";
import { ErrorMessages } from "../../utils/messages";

interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
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

export const registerService = async (data: RegisterInput) => {
  const { email, password, firstName, lastName, phone } = data;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    throw new BadRequestError(ErrorMessages.UserAlreadyExists);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create new user
  const user = new User({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password: hashedPassword,
    phone: phone || "",
    role: "user",
    active: true,
  });

  await user.save();

  // Create safe user object
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

  // Create token
  const token = await createToken({
    _id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  });

  return { user: safeUser, token };
};
