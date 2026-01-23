import { Request, Response, NextFunction } from "express";
import User from "../../models/user";
import Resource from "../../models/resource";
import { NotFoundError } from "../../utils/errors";

/**
 * GET /api/favorites
 * Lista omiljenih resursa (auth required) with search, filter, pagination
 */
export const getFavorites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new NotFoundError("Korisnik nije pronađen");
    }

    const {
      search,
      category,
      page = "1",
      limit = "20",
    } = req.query as { search?: string; category?: string; page?: string; limit?: string };

    const user = await User.findById(req.user._id).lean();

    if (!user) {
      throw new NotFoundError("Korisnik nije pronađen");
    }

    // Build filter
    const filter: any = {
      _id: { $in: user.favorites },
      status: "active",
    };

    // Search filter
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { 'location.city': searchRegex },
        { 'location.address': searchRegex },
      ];
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Get all favorites first to filter by category (since categoryId is populated)
    let favorites = await Resource.find(filter)
      .populate("categoryId", "name slug icon")
      .populate("ownerId", "firstName lastName profileImage")
      .lean();

    // Category filter (after populate)
    if (category && category.trim()) {
      favorites = favorites.filter((f: any) => f.categoryId?.name === category);
    }

    const total = favorites.length;

    // Apply pagination
    const paginatedFavorites = favorites.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      data: paginatedFavorites,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/favorites/:resourceId
 * Dodavanje resursa u omiljene (auth required)
 */
export const addFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new NotFoundError("Korisnik nije pronađen");
    }

    const { resourceId } = req.params;

    // Check if resource exists
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      throw new NotFoundError("Resurs nije pronađen");
    }

    // Add to favorites if not already there
    await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { favorites: resourceId } }
    );

    res.status(200).json({
      success: true,
      message: "Resurs je dodat u omiljene",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/favorites/:resourceId
 * Uklanjanje resursa iz omiljenih (auth required)
 */
export const removeFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new NotFoundError("Korisnik nije pronađen");
    }

    const { resourceId } = req.params;

    await User.updateOne(
      { _id: req.user._id },
      { $pull: { favorites: resourceId } }
    );

    res.status(200).json({
      success: true,
      message: "Resurs je uklonjen iz omiljenih",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/favorites/check/:resourceId
 * Provera da li je resurs u omiljenima (auth required)
 */
export const checkFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new NotFoundError("Korisnik nije pronađen");
    }

    const { resourceId } = req.params;

    const user = await User.findById(req.user._id).lean();

    if (!user) {
      throw new NotFoundError("Korisnik nije pronađen");
    }

    const isFavorite = user.favorites.some(
      (fav) => fav.toString() === resourceId
    );

    res.status(200).json({
      success: true,
      data: { isFavorite },
    });
  } catch (error) {
    next(error);
  }
};
