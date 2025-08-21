import express from "express";
import CustomerController from "../controllers/customer.controller";
import { authorizeRole } from "../middlewares/authorization";

const router = express.Router();

// GET /customers - Akses: Admin, Manager, Cashier
router.get(
  "/",
  authorizeRole("admin", "manager", "cashier"),
  CustomerController.getCustomer
);

// GET /customers/:id - Akses: Admin, Manager, Cashier
router.get(
  "/:id",
  authorizeRole("admin", "manager", "cashier"),
  CustomerController.getCustomerById
);

// POST /customers - Akses: Admin, Manager, Cashier (untuk registrasi saat checkout)
router.post(
  "/",
  authorizeRole("admin", "manager", "cashier"),
  CustomerController.createCustomer
);

// PUT /customers/:id - Akses: Admin, Manager
router.put(
  "/:id",
  authorizeRole("admin", "manager"),
  CustomerController.editCustomer
);

// DELETE /customers/:id - Akses: Admin only
router.delete(
  "/:id",
  authorizeRole("admin"),
  CustomerController.deleteCustomer
);

export default router;
