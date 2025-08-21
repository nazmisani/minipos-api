import ProductRouter from "./product.route";
import transactionRouter from "./transaction.route";
import userRouter from "./user.route";
import logRouter from "./log.route";
import authRouter from "./auth.route";
import reportRouter from "./report.route";
import categoryRouter from "./category.route";
import customerRoter from "./customer.route";

import express from "express";
import errorHandler from "../middlewares/errorHandler";
import authentication from "../middlewares/authentication";

const router = express.Router();

router.use("/auth", authRouter);

router.use(authentication);

router.use("/users", userRouter);
router.use("/products", ProductRouter);
router.use("/customers", customerRoter);
router.use("/categories", categoryRouter);
router.use("/transactions", transactionRouter);
router.use("/logs", logRouter);
router.use("/reports", reportRouter);

router.use(errorHandler);

export default router;
