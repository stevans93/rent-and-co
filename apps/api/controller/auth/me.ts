import { Request, Response, NextFunction } from "express";
import User from "../../models/user";
import { NotFoundError } from "../../utils/errors";

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new NotFoundError("Korisnik nije pronađen");
    }

    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      throw new NotFoundError("Korisnik nije pronađen");
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        city: user.city,
        role: user.role,
        profileImage: user.profileImage,
        active: user.active,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
