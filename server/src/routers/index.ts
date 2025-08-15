import AuthController from "../controllers/auth.controller";
import productRouter from "./product.route";
import transactionRouter from "./transaction.route";
import userRouter from "./user.route";
import logRouter from "./log.route";
import express from "express";

const router = express.Router();

router.post("/auth/login", AuthController.login);
router.post("auth/profile");
router.use("./user", userRouter);

router.use("./log", logRouter);
router.use("/product", productRouter);
router.use("/transaction", transactionRouter);

export default router;
