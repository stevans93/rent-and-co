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
      status: "pending", // New resources start as pending
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
