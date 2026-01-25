import { Request, Response, NextFunction } from "express";
import Resource from "../../models/resource";
import { NotFoundError } from "../../utils/errors";

interface QueryParams {
  q?: string;
  category?: string;
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  options?: string | string[];
  status?: string;
  isFeatured?: string;
  ownerId?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

/**
 * GET /api/resources
 * Lista resursa sa filterima i paginacijom
 */
export const getResources = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      q,
      category,
      city,
      minPrice,
      maxPrice,
      options,
      status,
      isFeatured,
      ownerId,
      sort = "newest",
      page = "1",
      limit = "12",
    } = req.query as QueryParams;

    // Build filter
    const filter: any = {};

    // Text search
    if (q) {
      filter.$text = { $search: q };
    }

    // Category filter (by slug)
    if (category) {
      const Category = (await import("../../models/category")).default;
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        filter.categoryId = cat._id;
      }
    }

    // City filter
    if (city) {
      filter["location.city"] = { $regex: city, $options: "i" };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }

    // Options filter
    if (options) {
      const optionsArray = Array.isArray(options) ? options : options.split(",");
      filter.options = { $all: optionsArray };
    }

    // Status filter (default to active for public)
    if (status) {
      filter.status = status;
    } else if (!ownerId) {
      filter.status = "active";
    }

    // Featured filter
    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === "true";
    }

    // Owner filter
    if (ownerId) {
      filter.ownerId = ownerId;
    }

    // Sorting
    let sortOption: any = { createdAt: -1 }; // default: newest
    switch (sort) {
      case "price_asc":
        sortOption = { pricePerDay: 1 };
        break;
      case "price_desc":
        sortOption = { pricePerDay: -1 };
        break;
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "popular":
        sortOption = { views: -1 };
        break;
      case "recommended":
        sortOption = { isFeatured: -1, createdAt: -1 };
        break;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate("categoryId", "name slug icon")
        .populate("ownerId", "firstName lastName profileImage")
        .lean(),
      Resource.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: resources,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/resources/:slug
 * Detalji resursa po slug-u
 */
export const getResourceBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const resource = await Resource.findOne({ slug })
      .populate("categoryId", "name slug icon coverImage")
      .populate("ownerId", "firstName lastName email phone profileImage city")
      .lean();

    if (!resource) {
      throw new NotFoundError("Resurs nije pronađen");
    }

    // Increment views
    await Resource.updateOne({ _id: resource._id }, { $inc: { views: 1 } });

    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/resources
 * Kreiranje novog resursa (auth required)
 */
export const createResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new NotFoundError("Korisnik nije pronađen");
    }

    const resourceData = {
      ...req.body,
      ownerId: req.user._id,
      status: req.body.status || "active", // Use provided status or default to active
    };

    const resource = new Resource(resourceData);
    await resource.save();

    res.status(201).json({
      success: true,
      data: resource,
      message: "Resurs je uspešno kreiran",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/resources/:id
 * Ažuriranje resursa (auth required, owner only)
 */
export const updateResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new NotFoundError("Korisnik nije pronađen");
    }

    const { id } = req.params;

    const resource = await Resource.findById(id);

    if (!resource) {
      throw new NotFoundError("Resurs nije pronađen");
    }

    // Check ownership (unless admin)
    if (resource.ownerId.toString() !== req.user._id && req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Nemate dozvolu za izmenu ovog resursa",
      });
      return;
    }

    // Update resource
    Object.assign(resource, req.body);
    await resource.save();

    res.status(200).json({
      success: true,
      data: resource,
      message: "Resurs je uspešno ažuriran",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/resources/:id
 * Brisanje resursa (auth required, owner only)
 */
export const deleteResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new NotFoundError("Korisnik nije pronađen");
    }

    const { id } = req.params;

    const resource = await Resource.findById(id);

    if (!resource) {
      throw new NotFoundError("Resurs nije pronađen");
    }

    // Check ownership (unless admin)
    if (resource.ownerId.toString() !== req.user._id && req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Nemate dozvolu za brisanje ovog resursa",
      });
      return;
    }

    await Resource.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: "Resurs je uspešno obrisan",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/resources/my
 * Lista resursa trenutno ulogovanog korisnika
 */
export const getMyResources = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new NotFoundError("Korisnik nije pronađen");
    }

    const {
      status,
      category,
      type,
      sort = "newest",
      page = "1",
      limit = "20",
      search,
    } = req.query as { status?: string; category?: string; type?: string; sort?: string; page?: string; limit?: string; search?: string };

    // Build filter - always filter by current user
    const filter: any = { ownerId: req.user._id };

    // Status filter (active/inactive)
    // "active" means active listings (includes active, menjam, poklanjam)
    // "inactive" means inactive listings
    if (status && status !== 'all') {
      if (status === 'active') {
        // Active listings include: active, menjam, poklanjam
        filter.status = { $in: ['active', 'menjam', 'poklanjam'] };
      } else if (status === 'inactive') {
        filter.status = 'inactive';
      } else {
        filter.status = status;
      }
    }

    // Type filter (izdajem, menjam, poklanjam)
    if (type && type !== 'all') {
      if (type === 'izdajem') {
        filter.status = 'active';
      } else if (type === 'menjam') {
        filter.status = 'menjam';
      } else if (type === 'poklanjam') {
        filter.status = 'poklanjam';
      }
    }

    // Category filter (by slug)
    if (category && category !== 'all') {
      const Category = (await import("../../models/category")).default;
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        filter.categoryId = cat._id;
      }
    }

    // Search filter (by title, city, or address)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { 'location.city': searchRegex },
        { 'location.address': searchRegex },
      ];
    }

    // Sorting
    let sortOption: any = { createdAt: -1 };
    switch (sort) {
      case "price_asc":
        sortOption = { pricePerDay: 1 };
        break;
      case "price_desc":
        sortOption = { pricePerDay: -1 };
        break;
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "popular":
        sortOption = { views: -1 };
        break;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [resources, total, stats] = await Promise.all([
      Resource.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate("categoryId", "name slug icon")
        .lean(),
      Resource.countDocuments(filter),
      Resource.aggregate([
        { $match: { ownerId: req.user._id } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalViews: { $sum: "$views" },
            totalFavorites: { $sum: "$favorites" },
          },
        },
      ]),
    ]);

    // Calculate stats by status
    const statusStats = stats.reduce((acc: any, item: any) => {
      acc[item._id] = {
        count: item.count,
        views: item.totalViews,
        favorites: item.totalFavorites,
      };
      return acc;
    }, {});

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: resources,
      stats: {
        total,
        active: statusStats.active?.count || 0,
        pending: statusStats.pending?.count || 0,
        rejected: statusStats.rejected?.count || 0,
        totalViews: Object.values(statusStats).reduce((sum: number, s: any) => sum + (s.views || 0), 0),
        totalFavorites: Object.values(statusStats).reduce((sum: number, s: any) => sum + (s.favorites || 0), 0),
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/resources/admin
 * Admin - Lista svih resursa
 */
export const getAdminResources = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: "Nemate dozvolu za ovu akciju",
      });
      return;
    }

    const {
      status,
      category,
      type,
      search,
      sort = "newest",
      page = "1",
      limit = "50",
    } = req.query as { status?: string; category?: string; type?: string; search?: string; sort?: string; page?: string; limit?: string };

    // Build filter
    const filter: any = {};

    // Status filter (active/inactive)
    if (status && status !== 'all') {
      if (status === 'active') {
        // Active listings include: active, menjam, poklanjam
        filter.status = { $in: ['active', 'menjam', 'poklanjam'] };
      } else if (status === 'inactive') {
        filter.status = 'inactive';
      } else {
        filter.status = status;
      }
    }

    // Type filter (izdajem, menjam, poklanjam)
    if (type && type !== 'all') {
      if (type === 'izdajem') {
        filter.status = 'active';
      } else if (type === 'menjam') {
        filter.status = 'menjam';
      } else if (type === 'poklanjam') {
        filter.status = 'poklanjam';
      }
    }

    // Category filter (by slug)
    if (category && category !== 'all') {
      const Category = (await import("../../models/category")).default;
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        filter.categoryId = cat._id;
      }
    }

    // Search filter
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { 'location.city': searchRegex },
        { 'location.address': searchRegex },
      ];
    }

    // Sorting
    let sortOption: any = { createdAt: -1 };
    switch (sort) {
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "views":
        sortOption = { views: -1 };
        break;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [resources, total, activeCount, inactiveCount] = await Promise.all([
      Resource.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate("categoryId", "name slug")
        .populate("ownerId", "firstName lastName email")
        .lean(),
      Resource.countDocuments(filter),
      Resource.countDocuments({ status: { $in: ['active', 'menjam', 'poklanjam'] } }),
      Resource.countDocuments({ status: 'inactive' }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: resources,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages,
      },
      stats: {
        total: activeCount + inactiveCount,
        active: activeCount,
        inactive: inactiveCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/resources/:id/status
 * Admin - Promena statusa resursa
 */
export const updateResourceStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: "Nemate dozvolu za ovu akciju",
      });
      return;
    }

    const { id } = req.params;
    const { status, reason } = req.body;

    const resource = await Resource.findByIdAndUpdate(
      id,
      { 
        status, 
        ...(reason && { rejectionReason: reason }),
      },
      { new: true }
    );

    if (!resource) {
      throw new NotFoundError("Resurs nije pronađen");
    }

    res.status(200).json({
      success: true,
      data: resource,
      message: `Status resursa je promenjen u ${status}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/resources/search/suggestions
 * Autocomplete suggestions za pretragu - brza pretraga od prvog slova
 */
export const getSearchSuggestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query as { q?: string };

    if (!q || q.length < 1) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Escape special regex characters
    const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Regex koji traži:
    // 1. Reči koje POČINJU sa unetim tekstom (za brzu pretragu od prvog slova)
    // 2. Ili sadrže uneti tekst bilo gde (za celu reč)
    const startsWithRegex = new RegExp(`\\b${escapedQuery}`, 'i'); // Reč počinje sa...
    const containsRegex = new RegExp(escapedQuery, 'i'); // Sadrži bilo gde

    const resources = await Resource.find({
      status: "active",
      $or: [
        { title: startsWithRegex },
        { title: containsRegex },
        { "location.city": startsWithRegex },
      ],
    })
      .select("title slug pricePerDay images location")
      .populate("categoryId", "name slug")
      .sort({ title: 1 }) // Sortiraj po naslovu za konzistentan redosled
      .limit(4) // Max 4 rezultata
      .lean();

    // Format suggestions
    const suggestions = resources.map((r: any) => ({
      id: r._id,
      title: r.title,
      slug: r.slug,
      price: r.pricePerDay,
      image: r.images?.[0]?.url || null,
      city: r.location?.city || null,
      category: r.categoryId?.name || null,
    }));

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
};
