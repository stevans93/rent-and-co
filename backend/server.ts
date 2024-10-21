import express, { Express } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { DB_URL, PORT, CORS_OPTIONS, NODE_ENV } from "./config/config";
const server: Express = express();

server.use(
  cors(
    NODE_ENV === "development"
      ? CORS_OPTIONS.corsOptionsDev
      : CORS_OPTIONS.corsOptionsProd
  )
);

mongoose
  .connect(DB_URL || "")
  .then(() => {
    console.log("MongoDB Connected!");
  })
  .catch((err) => {
    console.log(err);
  });

server.use(express.json());

// server.use("/api", require("./routes"));

server.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
