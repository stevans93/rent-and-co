import { Response, Request } from "express";
import { registerService } from "../../services/auth/register";

export const register = async (req: Request, res: Response) => {
  // Inline export
  const body = req.body;

  const data = await registerService({ ...body });

  return res.status(200).json(data);
};
