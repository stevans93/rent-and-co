import User from "../../models/user";
import { BadRequestError } from "../../utils/errors";
import { ErrorMessages } from "../../utils/messages";
import { comparePassword } from "../../utils/bcrypt";
import { createToken } from "../../utils/jwt";
import { ILoginRequest } from "../../types/request";

export const loginService = async (data: ILoginRequest) => {
  const { email, password } = data;

  let user = await User.findOne({ email: email }, null, { lean: true });

  if (!user) {
    throw new BadRequestError(ErrorMessages.UserNotExists);
  }

  if (user.password) {
    let isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      throw new BadRequestError(ErrorMessages.PasswordNotValid);
    }
  }

  const { password: _, ...userWithoutPassword } = user;

  const token = await createToken({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  });

  return { userWithoutPassword, token };
};
