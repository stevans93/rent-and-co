import { Request, Response, NextFunction } from "express";
import User from "../../models/user";
import Resource from "../../models/resource";
import { NotFoundError } from "../../utils/errors";

/**
 * GET /api/favorites
 * Lista omiljenih resursa (auth required)
 */
export const getFavorites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new NotFoundError("Korisnik nije pronađen");
    }

    const user = await User.findById(req.user._id).lean();

    if (!user) {
      throw new NotFoundError("Korisnik nije pronađen");
    }

    const favorites = await Resource.find({
      _id: { $in: user.favorites },
      status: "active",
    })
      .populate("categoryId", "name slug icon")
      .populate("ownerId", "firstName lastName profileImage")
      .lean();

    res.status(200).json({
      success: true,
      data: favorites,
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
