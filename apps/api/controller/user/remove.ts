import { Request, Response } from "express";
import { removeService } from "../../services/user/remove";

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;

  const removeRequest = await removeService(id);

  res.status(200).json(removeRequest);
};
