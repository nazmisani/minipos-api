import express from "express";
import AuthController from "../controllers/auth.controller";

const router = express.Router();

router.post("/auth/login", AuthController.login);
router.post("/auth/profile", AuthController.getProfile);

export default router;
