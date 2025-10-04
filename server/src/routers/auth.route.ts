import express from "express";
import AuthController from "../controllers/auth.controller";
import authentication from "../middlewares/authentication";
import { authLimiter, passwordChangeLimiter } from "../middlewares/rateLimiter";

const router = express.Router();

router.post("/login", authLimiter, AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/profile", authentication, AuthController.getProfile);
router.put(
  "/change-password",
  authentication,
  passwordChangeLimiter,
  AuthController.changePassword
);

export default router;
