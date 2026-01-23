import { Request, Response, NextFunction } from "express";
import sharp from "sharp";
import path from "path";
import fs from "fs";

/**
 * Middleware to compress uploaded images using sharp
 * Converts images to WebP format with good quality and smaller size
 */
export const compressImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return next();
    }

    const compressedFiles: Express.Multer.File[] = [];

    for (const file of files) {
      const originalPath = file.path;
      const ext = path.extname(file.filename);
      const nameWithoutExt = file.filename.replace(ext, "");
      const newFilename = `${nameWithoutExt}.webp`;
      const newPath = path.join(path.dirname(originalPath), newFilename);

      try {
        // Get image metadata to determine optimal resize
        const metadata = await sharp(originalPath).metadata();
        const originalWidth = metadata.width || 1920;
        const originalHeight = metadata.height || 1080;

        // Calculate resize dimensions (max 1920px width, maintain aspect ratio)
        const maxWidth = 1920;
        const maxHeight = 1080;
        let resizeWidth = originalWidth;
        let resizeHeight = originalHeight;

        if (originalWidth > maxWidth) {
          resizeWidth = maxWidth;
          resizeHeight = Math.round((originalHeight * maxWidth) / originalWidth);
        }

        if (resizeHeight > maxHeight) {
          resizeHeight = maxHeight;
          resizeWidth = Math.round((originalWidth * maxHeight) / originalHeight);
        }

        // Compress and convert to WebP
        await sharp(originalPath)
          .resize(resizeWidth, resizeHeight, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({
            quality: 82, // Good balance between quality and size
            effort: 4, // Compression effort (0-6)
          })
          .toFile(newPath);

        // Delete original file
        if (fs.existsSync(originalPath)) {
          fs.unlinkSync(originalPath);
        }

        // Get new file stats
        const stats = fs.statSync(newPath);

        // Update file object with new info
        compressedFiles.push({
          ...file,
          filename: newFilename,
          path: newPath,
          size: stats.size,
          mimetype: "image/webp",
        });
      } catch (compressionError) {
        console.error(`Error compressing ${file.filename}:`, compressionError);
        // Keep original file if compression fails
        compressedFiles.push(file);
      }
    }

    // Replace files with compressed versions
    req.files = compressedFiles;
    next();
  } catch (error) {
    console.error("Image compression error:", error);
    next(error);
  }
};

export default compressImages;
