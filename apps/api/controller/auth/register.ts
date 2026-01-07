import { Response, Request, NextFunction } from "express";
import { registerService } from "../../services/auth/register";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    const result = await registerService({ firstName, lastName, email, password, phone });

    res.status(201).json({
      success: true,
      data: result,
      message: "Registracija uspešna",
    });
  } catch (error) {
    next(error);
  }
};
