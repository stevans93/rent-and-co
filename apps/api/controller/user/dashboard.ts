import { Request, Response, NextFunction } from "express";
import Resource from "../../models/resource";
import User from "../../models/user";
import Inquiry from "../../models/inquiry";
import { NotFoundError } from "../../utils/errors";

/**
 * GET /api/user/dashboard/stats
 * Dashboard statistika za korisnika (auth required)
 */
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new NotFoundError("Korisnik nije pronađen");
    }

    const userId = req.user._id;

    // Get user's active resources
    const userResources = await Resource.find({ ownerId: userId }).lean();
    
    // Count active listings
    const activeListings = userResources.filter(r => r.status === "active").length;
    
    // Calculate total views across all user's resources
    const totalViews = userResources.reduce((sum, r) => sum + (r.views || 0), 0);
    
    // Count how many times user's resources are favorited by others
    const resourceIds = userResources.map(r => r._id);
    const favoritesCount = await User.countDocuments({
      favorites: { $in: resourceIds }
    });
    
    // Calculate conversion rate (favorites / views * 100)
    const conversionRate = totalViews > 0 
      ? parseFloat(((favoritesCount / totalViews) * 100).toFixed(1)) 
      : 0;

    // Get recent activity for user's resources
    const recentInquiries = await Inquiry.find({ ownerId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("resourceId", "title slug")
      .lean();

    // Format recent activity
    const recentActivity = recentInquiries.map(inquiry => ({
      type: inquiry.status === "pending" ? "new_message" : "message_read",
      title: inquiry.status === "pending" ? "Nova poruka" : "Poruka pročitana",
      resourceTitle: (inquiry.resourceId as any)?.title || "Nepoznat oglas",
      resourceSlug: (inquiry.resourceId as any)?.slug || "",
      senderName: inquiry.senderName,
      createdAt: inquiry.createdAt,
    }));

    // Calculate changes (mock for now, would need historical data)
    // TODO: Implement actual change tracking with separate collection

    res.status(200).json({
      success: true,
      data: {
        stats: {
          activeListings,
          totalViews,
          favorites: favoritesCount,
          conversionRate,
        },
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};
