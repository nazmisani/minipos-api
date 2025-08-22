import express from "express";
import CustomerController from "../controllers/customer.controller";
import { authorizeRole } from "../middlewares/authorization";

const router = express.Router();

router.get(
  "/",
  authorizeRole("admin", "manager", "cashier"),
  CustomerController.getCustomer
);

router.get(
  "/:id",
  authorizeRole("admin", "manager", "cashier"),
  CustomerController.getCustomerById
);

router.post(
  "/",
  authorizeRole("admin", "manager", "cashier"),
  CustomerController.createCustomer
);

router.put(
  "/:id",
  authorizeRole("admin", "manager"),
  CustomerController.editCustomer
);

router.delete(
  "/:id",
  authorizeRole("admin"),
  CustomerController.deleteCustomer
);

export default router;
