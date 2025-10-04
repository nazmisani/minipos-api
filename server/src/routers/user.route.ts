import express from "express";
import UserController from "../controllers/user.controller";
import { authorizeRole } from "../middlewares/authorization";
import {
  userManagementLimiter,
  createLimiter,
} from "../middlewares/rateLimiter";

const router = express.Router();

router.get("/", authorizeRole("admin"), UserController.getUser);
router.get(
  "/total",
  authorizeRole("admin", "manager", "cashier"),
  UserController.getTotalUser
);
router.post(
  "/",
  authorizeRole("admin"),
  createLimiter,
  UserController.createUser
);
router.put(
  "/:id",
  authorizeRole("admin"),
  userManagementLimiter,
  UserController.updateUser
);
router.delete(
  "/:id",
  authorizeRole("admin"),
  userManagementLimiter,
  UserController.deleteUser
);
export default router;
