import express from "express";
import TransactionController from "../controllers/transaction.controller";
import authentication from "../middlewares/authentication";
import { authorizeRole } from "../middlewares/authorization";
import { transactionLimiter } from "../middlewares/rateLimiter";

const router = express.Router();

router.get(
  "/",
  authentication,
  authorizeRole("admin", "manager", "cashier"),
  TransactionController.getTransactions
);
router.get(
  "/today",
  authentication,
  authorizeRole("admin", "manager", "cashier"),
  TransactionController.getTodaysTransactions
);
router.post(
  "/",
  authentication,
  authorizeRole("admin", "cashier"),
  transactionLimiter,
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
