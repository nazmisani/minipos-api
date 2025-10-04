import express from "express";
import ProductController from "../controllers/product.controller";
import { authorizeRole } from "../middlewares/authorization";

const router = express.Router();

// GET /products - Akses: Admin, Manager, Cashier
router.get(
  "/",
  authorizeRole("admin", "manager", "cashier"),
  ProductController.getProduct
);

router.get(
  "/total",
  authorizeRole("admin", "manager", "cashier"),
  ProductController.totalProduct
);

// GET /products/search - Akses: Admin, Manager, Cashier
router.get(
  "/search",
  authorizeRole("admin", "manager", "cashier"),
  ProductController.searchProducts
);

// GET /products/all - Akses: Admin, Manager, Cashier (untuk dropdown/POS)
router.get(
  "/all",
  authorizeRole("admin", "manager", "cashier"),
  ProductController.getAllProducts
);

// GET /products/:id - Akses: Admin, Manager, Cashier
router.get(
  "/:id",
  authorizeRole("admin", "manager", "cashier"),
  ProductController.getProductById
);

// POST /products - Akses: Admin, Manager
router.post(
  "/",
  authorizeRole("admin", "manager"),
  ProductController.createProduct
);

// PUT /products/:id - Akses: Admin, Manager
router.put(
  "/:id",
  authorizeRole("admin", "manager"),
  ProductController.editProduct
);

// DELETE /products/:id - Akses: Admin, Manager
router.delete(
  "/:id",
  authorizeRole("admin", "manager"),
  ProductController.deleteProduct
);

export default router;
