import express from "express";
import AuthController from "../controllers/auth.controller";
import authentication from "../middlewares/authentication";

const router = express.Router();

router.post("/login", AuthController.login);
router.get("/profile", authentication, AuthController.getProfile);

export default router;
