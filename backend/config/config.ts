export const DB_URL = process.env.DB_URL;
export const PORT = process.env.PORT;
export const NODE_ENV = process.env.NODE_ENV;

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
