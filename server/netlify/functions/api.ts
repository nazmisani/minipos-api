import { Handler } from "@netlify/functions";
import serverless from "serverless-http";
import express from "express";
import cookieParser from "cookie-parser";
import { generalLimiter } from "../../src/middlewares/rateLimiter";
import router from "../../src/routers/index.route";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const cors = require("cors");

// Create Express app
const app = express();

// CORS Configuration
const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("⚠️  CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};

app.use(cors(corsOptions));

// Rate limiting (optional for serverless)
// app.use(generalLimiter);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use existing routes
app.use("/.netlify/functions/api", router);

// Create serverless handler
const serverlessHandler = serverless(app);

// Export Netlify handler with proper type conversion
export const handler: Handler = async (event, context) => {
  const result = await serverlessHandler(event, context);
  return result as any;
};
