import User from "../../models/user";
import { BadRequestError } from "../../utils/errors";
import { ErrorMessages } from "../../utils/messages";

export const getService = async (id: string) => {
  const user = await User.findById(id);

  if (!user) {
    throw new BadRequestError(ErrorMessages.UserNotFound);
  }

  return user;
};
