import AuthController from "../controllers/authController";
import CategoryController from "../controllers/categoryController";
import ProductController from "../controllers/productController";
import TransactionController from "../controllers/transactionController";
import TransactionDetailController from "../controllers/transactionDetailController";

const express = require("express");
const router = express.Router();

router.post("/login", AuthController.login);
router.post("/register", AuthController.register);

router.post("/product", ProductController.addProduct);
router.post("/category", CategoryController.addCategory);
router.post("/transaction", TransactionController.addTransaction);
router.post(
  "/transaction_detail",
  TransactionDetailController.addTransactionDetail
);

export default router;
