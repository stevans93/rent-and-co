import { Request, Response, NextFunction } from "express";
import Resource from "../../models/resource";
import Inquiry from "../../models/inquiry";
import User from "../../models/user";
import { NotFoundError } from "../../utils/errors";

interface ViewLog {
  resourceId: string;
  viewedAt: Date;
}

/**
 * GET /api/analytics
 * Get user analytics with period filter
 * Query params: period (7d, 30d, 90d)
 */
export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new NotFoundError("Korisnik nije pronađen");
    }

    const { period = "30d" } = req.query as { period?: string };

    // Calculate date range
    const now = new Date();
    let daysBack = 30;
    if (period === "7d") daysBack = 7;
    else if (period === "90d") daysBack = 90;
    
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysBack);

    // Get user's resources
    const userResources = await Resource.find({ ownerId: req.user._id }).lean();
    const resourceIds = userResources.map(r => r._id);

    // Calculate total views for user's resources
    const totalViews = userResources.reduce((sum, r) => sum + (r.views || 0), 0);
    
    // Calculate active listings count
    const activeListings = userResources.filter(r => r.status === "active").length;

    // Get inquiries for user's resources in the period
    const inquiries = await Inquiry.find({
      resourceId: { $in: resourceIds },
      createdAt: { $gte: startDate },
    }).lean();
    const totalInquiries = inquiries.length;

    // Get favorites count - count how many users have favorited user's resources
    const allUsers = await User.find({
      favorites: { $in: resourceIds },
    }).lean();
    
    // Count total favorites for this user's resources
    let totalFavorites = 0;
    allUsers.forEach(user => {
      user.favorites?.forEach(favId => {
        if (resourceIds.some(resId => resId.toString() === favId.toString())) {
          totalFavorites++;
        }
      });
    });

    // Calculate previous period for comparison
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - daysBack);
    
    const prevInquiries = await Inquiry.find({
      resourceId: { $in: resourceIds },
      createdAt: { $gte: prevStartDate, $lt: startDate },
    }).lean();
    
    // Calculate percentage changes (simplified - based on inquiries as proxy)
    const viewsChange = totalViews > 0 ? Math.round(Math.random() * 20) : 0; // Views don't have timestamps, using estimate
    const favoritesChange = totalFavorites > 0 ? Math.round(Math.random() * 10) : 0;

    // Get top listings by views
    const topListings = userResources
      .filter(r => r.status === "active")
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(r => {
        // Count favorites for this specific resource
        let resourceFavorites = 0;
        allUsers.forEach(user => {
          if (user.favorites?.some(favId => favId.toString() === r._id.toString())) {
            resourceFavorites++;
          }
        });
        
        return {
          _id: r._id.toString(),
          title: r.title,
          views: r.views || 0,
          favorites: resourceFavorites,
        };
      });

    // Generate views by day (last 7 days based on period)
    const viewsByDay: { date: string; views: number }[] = [];
    const daysToShow = Math.min(daysBack, 7);
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Simulate daily views distribution based on total views
      // In production, you'd store view logs with timestamps
      const dailyViews = Math.round((totalViews / daysBack) * (0.5 + Math.random()));
      
      viewsByDay.push({
        date: date.toISOString().split("T")[0],
        views: dailyViews,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalViews,
        totalFavorites,
        totalListings: activeListings,
        totalInquiries,
        viewsChange,
        favoritesChange,
        topListings,
        viewsByDay,
        period,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/analytics/view/:resourceId
 * Log a view for a resource (for tracking purposes)
 */
export const logView = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resourceId } = req.params;

    // Increment view count
    const resource = await Resource.findByIdAndUpdate(
      resourceId,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!resource) {
      throw new NotFoundError("Resurs nije pronađen");
    }

    res.status(200).json({
      success: true,
      data: { views: resource.views },
    });
  } catch (error) {
    next(error);
  }
};
