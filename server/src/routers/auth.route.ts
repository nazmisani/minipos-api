import express from "express";
import AuthController from "../controllers/auth.controller";
import authentication from "../middlewares/authentication";

const router = express.Router();

router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/profile", authentication, AuthController.getProfile);
router.put("/change-password", authentication, AuthController.changePassword);

export default router;
