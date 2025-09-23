import express from "express";
import UserController from "../controllers/user.controller";
import { authorizeRole } from "../middlewares/authorization";
const router = express.Router();

router.get("/", authorizeRole("admin"), UserController.getUser);
router.get(
  "/total",
  authorizeRole("admin", "manager", "cashier"),
  UserController.getTotalUser
);
router.post("/", authorizeRole("admin"), UserController.createUser);
router.put("/:id", authorizeRole("admin"), UserController.updateUser);
router.delete("/:id", authorizeRole("admin"), UserController.deleteUser);
export default router;
