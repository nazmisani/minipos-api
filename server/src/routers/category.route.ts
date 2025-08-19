import express from "express";
import CategoryController from "../controllers/category.controller";
import { authorizeRole } from "../middlewares/authorization";

const router = express.Router();

// GET /categories - Akses: Admin, Manager, Cashier
router.get(
  "/",
  authorizeRole("admin", "manager", "cashier"),
  CategoryController.getCategory
);

// POST /categories - Akses: Admin, Manager
router.post(
  "/",
  authorizeRole("admin", "manager"),
  CategoryController.createCategory
);

// PUT /categories/:id - Akses: Admin, Manager
router.put(
  "/:id",
  authorizeRole("admin", "manager"),
  CategoryController.editCategory
);

// DELETE /categories/:id - Akses: Admin only
router.delete(
  "/:id",
  authorizeRole("admin"),
  CategoryController.deleteCategory
);

export default router;
