import User from "../../models/user";

export const removeService = async (id: string) => {
  const removeUser = await User.findByIdAndDelete(id);

  return removeUser;
};
