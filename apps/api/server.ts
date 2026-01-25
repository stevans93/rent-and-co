import express, { Express, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import apiRoutes from "./routes/index";
import { errorHandler, notFoundHandler } from "./middleware";
import { DB_URL, PORT, CORS_OPTIONS, NODE_ENV } from "./config/config";

const server: Express = express();

// CORS
server.use(
  cors(
    NODE_ENV === "development"
      ? CORS_OPTIONS.corsOptionsDev
      : CORS_OPTIONS.corsOptionsProd
  )
);

// Body parsing
server.use(express.json({ limit: "10mb" }));
server.use(express.urlencoded({ extended: true }));

// Static files - serve uploaded images
server.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Security headers (basic, without helmet for now)
server.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// MongoDB connection
mongoose
  .connect(DB_URL)
  .then(() => {
    console.log("MongoDB Connected!");
  })
  .catch((err: Error) => {
    console.log("MongoDB Connection Error:", err.message);
  });

// Health check endpoint
server.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// API routes
server.use("/api", apiRoutes);

// 404 handler
server.use(notFoundHandler);

// Error handler (must be last)
server.use(errorHandler);

server.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
