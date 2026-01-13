import { Request, Response, NextFunction } from "express";
import User from "../../models/user";

export const getAll = async (req: Request, res: Response) => {
  const data = await User.find({}, { password: 0 });

  return res.status(200).json({ data });
};

/**
 * GET /api/users
 * Admin - Lista svih korisnika sa paginacijom
 */
export const getAdminUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: "Nemate dozvolu za ovu akciju",
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (role && ['user', 'moderator', 'admin'].includes(role)) {
      filter.role = role;
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter, { password: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/:id/role
 * Admin - Promena uloge korisnika
 */
export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: "Nemate dozvolu za ovu akciju",
      });
      return;
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'moderator', 'admin'].includes(role)) {
      res.status(400).json({
        success: false,
        message: "Nevažeća uloga",
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, select: '-password' }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Korisnik nije pronađen",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
      message: `Uloga korisnika je promenjena u ${role}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/:id
 * Admin - Brisanje korisnika
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: "Nemate dozvolu za ovu akciju",
      });
      return;
    }

    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user._id) {
      res.status(400).json({
        success: false,
        message: "Ne možete obrisati sopstveni nalog",
      });
      return;
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Korisnik nije pronađen",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Korisnik je uspešno obrisan",
    });
  } catch (error) {
    next(error);
  }
};
