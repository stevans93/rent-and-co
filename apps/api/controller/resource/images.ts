import { Request, Response, NextFunction } from "express";
import Resource from "../../models/resource";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../utils/errors";
import fs from "fs";
import path from "path";

/**
 * POST /api/resources/:id/images
 * Upload images for a resource
 */
export const uploadResourceImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new BadRequestError("Nijedna slika nije uploadovana");
    }

    // Find resource
    const resource = await Resource.findById(id);
    if (!resource) {
      // Delete uploaded files
      files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      throw new NotFoundError("Resurs nije pronađen");
    }

    // Check ownership
    if (resource.ownerId.toString() !== req.user?._id) {
      // Delete uploaded files
      files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      throw new ForbiddenError("Nemate dozvolu za ovu akciju");
    }

    // Get title for default alt text
    const title = resource.title;

    // Get current max order
    const currentMaxOrder = resource.images.length > 0
      ? Math.max(...resource.images.map((img) => img.order || 0))
      : -1;

    // Create image objects
    const newImages = files.map((file, index) => ({
      url: `/uploads/${file.filename}`,
      alt: `${title} — fotografija`,
      order: currentMaxOrder + 1 + index,
    }));

    // Add new images to resource
    resource.images.push(...newImages);
    await resource.save();

    res.status(201).json({
      success: true,
      message: `${files.length} slika uspešno uploadovano`,
      data: newImages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/resources/:id/images/:imageIndex
 * Delete a specific image from a resource
 */
export const deleteResourceImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, imageIndex } = req.params;
    const index = parseInt(imageIndex as string, 10);

    // Find resource
    const resource = await Resource.findById(id);
    if (!resource) {
      throw new NotFoundError("Resurs nije pronađen");
    }

    // Check ownership
    if (resource.ownerId.toString() !== req.user?._id) {
      throw new ForbiddenError("Nemate dozvolu za ovu akciju");
    }

    // Check if image index is valid
    if (index < 0 || index >= resource.images.length) {
      throw new BadRequestError("Nevažeći indeks slike");
    }

    // Get image to delete
    const imageToDelete = resource.images[index];

    // Delete file from filesystem if it's a local file
    if (imageToDelete.url.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, "../../..", imageToDelete.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Remove image from array
    resource.images.splice(index, 1);

    // Reorder remaining images
    resource.images = resource.images.map((img, idx) => ({
      ...img,
      order: idx,
    }));

    await resource.save();

    res.json({
      success: true,
      message: "Slika uspešno obrisana",
      data: resource.images,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/resources/:id/images/:imageIndex
 * Update image alt text or order
 */
export const updateResourceImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, imageIndex } = req.params;
    const { alt, order } = req.body;
    const index = parseInt(imageIndex as string, 10);

    // Find resource
    const resource = await Resource.findById(id);
    if (!resource) {
      throw new NotFoundError("Resurs nije pronađen");
    }

    // Check ownership
    if (resource.ownerId.toString() !== req.user?._id) {
      throw new ForbiddenError("Nemate dozvolu za ovu akciju");
    }

    // Check if image index is valid
    if (index < 0 || index >= resource.images.length) {
      throw new BadRequestError("Nevažeći indeks slike");
    }

    // Update alt text if provided
    if (alt !== undefined) {
      resource.images[index].alt = alt;
    }

    // Update order if provided
    if (order !== undefined) {
      resource.images[index].order = order;
    }

    await resource.save();

    res.json({
      success: true,
      message: "Slika uspešno ažurirana",
      data: resource.images[index],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/resources/:id/images/reorder
 * Reorder images
 */
export const reorderResourceImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { order } = req.body; // Array of image indices in new order

    if (!Array.isArray(order)) {
      throw new BadRequestError("Order mora biti niz");
    }

    // Find resource
    const resource = await Resource.findById(id);
    if (!resource) {
      throw new NotFoundError("Resurs nije pronađen");
    }

    // Check ownership
    if (resource.ownerId.toString() !== req.user?._id) {
      throw new ForbiddenError("Nemate dozvolu za ovu akciju");
    }

    // Validate order array
    if (order.length !== resource.images.length) {
      throw new BadRequestError("Nevažeći niz za reorder");
    }

    // Reorder images
    const reorderedImages = order.map((oldIndex: number, newIndex: number) => ({
      url: resource.images[oldIndex].url,
      alt: resource.images[oldIndex].alt,
      order: newIndex,
    }));

    resource.images = reorderedImages;
    await resource.save();

    res.json({
      success: true,
      message: "Slike uspešno preuređene",
      data: resource.images,
    });
  } catch (error) {
    next(error);
  }
};
