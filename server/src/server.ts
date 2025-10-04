import router from "./routers/index.route";
import express from "express";
import cookieParser from "cookie-parser";
import { generalLimiter } from "./middlewares/rateLimiter";

const app = express();
const port = process.env.PORT;
let cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Apply general rate limiting to all routes
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
