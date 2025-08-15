import AuthController from "../controllers/authController";
import productRouter from "./product";
import categoryRouter from "./category";
import transactionRouter from "./transaction";
import transactionDetailRouter from "./transactionDetail";
import express from "express";

const router = express.Router();

router.post("/login", AuthController.login);
router.post("/register", AuthController.createUser);

router.use("/product", productRouter);
router.use("/category", categoryRouter);
router.use("/transaction", transactionRouter);
router.use("/transaction_detail", transactionDetailRouter);

export default router;
