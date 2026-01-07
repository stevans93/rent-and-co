import { Request, Response, NextFunction } from "express";
import Category from "../../models/category";
import Resource from "../../models/resource";
import { NotFoundError } from "../../utils/errors";

/**
 * GET /api/categories
 * Lista svih kategorija
 */
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.find().sort({ order: 1 }).lean();

    // Get resource counts for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Resource.countDocuments({ 
          categoryId: cat._id, 
          status: "active" 
        });
        return {
          id: cat._id.toString(),
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          coverImage: cat.coverImage,
          order: cat.order,
          resourceCount: count,
          count: count,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: categoriesWithCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/categories/:slug
 * Detalji kategorije po slug-u
 */
export const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug }).lean();

    if (!category) {
      throw new NotFoundError("Kategorija nije pronađena");
    }

    // Get resource count
    const resourceCount = await Resource.countDocuments({ 
      categoryId: category._id, 
      status: "active" 
    });

    res.status(200).json({
      success: true,
      data: {
        ...category,
        resourceCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/categories (admin only)
 * Kreiranje nove kategorije
 */
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, icon, coverImage, order } = req.body;

    const category = new Category({
      name,
      icon,
      coverImage,
      order: order || 0,
    });

    await category.save();

    res.status(201).json({
      success: true,
      data: category,
      message: "Kategorija je uspešno kreirana",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/categories/:id (admin only)
 * Ažuriranje kategorije
 */
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!category) {
      throw new NotFoundError("Kategorija nije pronađena");
    }

    res.status(200).json({
      success: true,
      data: category,
      message: "Kategorija je uspešno ažurirana",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/categories/:id (admin only)
 * Brisanje kategorije
 */
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if category has resources
    const resourceCount = await Resource.countDocuments({ categoryId: id });
    if (resourceCount > 0) {
      res.status(400).json({
        success: false,
        message: `Nije moguće obrisati kategoriju koja ima ${resourceCount} resursa`,
      });
      return;
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      throw new NotFoundError("Kategorija nije pronađena");
    }

    res.status(200).json({
      success: true,
      message: "Kategorija je uspešno obrisana",
    });
  } catch (error) {
    next(error);
  }
};
