import { Request, Response, NextFunction } from "express";
import User from "../../models/user";
import Resource from "../../models/resource";

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
    const listingStatus = req.query.listingStatus as string; // Filter by listing status
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (role && ['user', 'moderator', 'admin'].includes(role)) {
      filter.role = role;
    }

    // If filtering by listing status, we need to get user IDs first
    let userIdsWithListings: string[] | null = null;
    if (listingStatus === 'with-active') {
      // Users with at least one active listing
      const usersWithActive = await Resource.distinct('ownerId', { status: 'active' });
      userIdsWithListings = usersWithActive.map(id => id.toString());
      filter._id = { $in: usersWithActive };
    } else if (listingStatus === 'with-inactive') {
      // Users with at least one inactive listing
      const usersWithInactive = await Resource.distinct('ownerId', { status: 'inactive' });
      userIdsWithListings = usersWithInactive.map(id => id.toString());
      filter._id = { $in: usersWithInactive };
    } else if (listingStatus === 'no-listings') {
      // Users with no listings at all
      const usersWithListings = await Resource.distinct('ownerId');
      filter._id = { $nin: usersWithListings };
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter, { password: 0, resetPasswordToken: 0, resetPasswordExpires: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get resource counts for each user
    const userIds = users.map(u => u._id);
    const resourceCounts = await Resource.aggregate([
      { $match: { ownerId: { $in: userIds } } },
      {
        $group: {
          _id: { ownerId: '$ownerId', status: '$status' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Map resource counts to users
    const countMap: Record<string, { active: number; inactive: number }> = {};
    resourceCounts.forEach((rc: { _id: { ownerId: any; status: string }; count: number }) => {
      const odId = rc._id.ownerId.toString();
      if (!countMap[odId]) {
        countMap[odId] = { active: 0, inactive: 0 };
      }
      if (rc._id.status === 'active') {
        countMap[odId].active = rc.count;
      } else if (rc._id.status === 'inactive') {
        countMap[odId].inactive = rc.count;
      }
    });

    // Add counts to users
    const usersWithCounts = users.map(u => ({
      ...u,
      resourceCounts: countMap[u._id.toString()] || { active: 0, inactive: 0 }
    }));

    res.status(200).json({
      success: true,
      data: usersWithCounts,
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
