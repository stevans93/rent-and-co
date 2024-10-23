import { Request, Response } from "express";
import { loginService } from "../../services/auth/login";

export const login = async (req: Request, res: Response) => {
  const body = req.body;

  const data = await loginService(body);

  res.status(200).json({ user: data.userWithoutPassword, token: data.token });
};
