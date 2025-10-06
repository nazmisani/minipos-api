import router from "./routers/index.route";
import express from "express";
import cookieParser from "cookie-parser";
import { generalLimiter } from "./middlewares/rateLimiter";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
let cors = require("cors");

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

app.use(generalLimiter);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

app.listen(port, () => {
  console.log("🔥 SERVER STARTING...");
  console.log(`🎉 Minipos app listening on port ${port}`);
  console.log(`🌐 Server ready at: http://localhost:${port}`);
});
