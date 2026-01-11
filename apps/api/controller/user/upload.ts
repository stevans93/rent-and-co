import { Request, Response } from "express";
import { uploadService } from "../../services/user/upload";

export const upload = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  const uploaded = await uploadService(id as string, data);

  res.status(200).json(uploaded);
};
