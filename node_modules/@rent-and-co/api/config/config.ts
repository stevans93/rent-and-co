import dotenv from "dotenv";

dotenv.config();

export const DB_URL = process.env.DB_URL || "";
export const PORT = process.env.PORT;
export const NODE_ENV = process.env.NODE_ENV;
export const JWT_KEY = process.env.JWT_KEY;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export const CORS_OPTIONS = {
  corsOptionsDev: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
  corsOptionsProd: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
};
