import { Request, Response } from "express";
import User from "../../models/user";

export const getAll = async (req: Request, res: Response) => {
  const data = await User.find({}, { password: 0 });

  return res.status(200).json({ data });
};
