import User from "../../models/user";
import { BadRequestError } from "../../utils/errors";
import { ErrorMessages } from "../../utils/messages";

export const uploadService = async (id: string, data: object) => {
  const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });

  if (!updatedUser) {
    throw new BadRequestError(ErrorMessages.UserNotFound);
  }

  return updatedUser;
};
