import express from "express";
import TransactionController from "../controllers/transaction.controller";
import authentication from "../middlewares/authentication";
import { authorizeRole } from "../middlewares/authorization";

const router = express.Router();

router.get(
  "/",
  authentication,
  authorizeRole("admin", "manager"),
  TransactionController.getTransactions
);
router.post(
  "/",
  authentication,
  authorizeRole("admin", "cashier"),
  TransactionController.createTransaction
);
router.get(
  "/:id",
  authentication,
  authorizeRole("admin", "manager", "cashier"),
  TransactionController.getTransactionById
);
router.delete(
  "/:id",
  authentication,
  authorizeRole("admin"),
  TransactionController.deleteTransaction
);

export default router;
