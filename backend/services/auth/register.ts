import { IRegisterRequest } from "../../types/request";
import User from "../../models/user";
import { hashPassword } from "../../utils/bcrypt";
import { BadRequestError } from "../../utils/errors";
import { ErrorMessages } from "../../utils/messages";

export const registerService = async (data: IRegisterRequest) => {
  const { email, password } = data;

  let user = await User.findOne({ email });

  if (user) {
    throw new BadRequestError(ErrorMessages.UserAlreadyExists);
  }

  const hashedPassword = await hashPassword(password);

  user = new User({
    ...data,
    email,
    password: hashedPassword,
  });

  await user.save();
};
