import { Request, Response } from "express";
import { getService } from "../../services/user/get";

export const get = async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await getService(id as string);

  res.status(200).json(user);
};
