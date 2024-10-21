export const DB_URL =
  process.env.DB_URL ||
  "mongodb+srv://stevans93:VxzhhyKFj0lCO5dr@cluster0.cukqi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
export const PORT = process.env.PORT || 4000;
export const NODE_ENV = process.env.NODE_ENV || "development";

export const CORS_OPTIONS = {
  corsOptionsDev: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
  corsOptionsProd: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
};
