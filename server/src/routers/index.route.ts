import ProductRouter from "./product.route";
import TransactionRouter from "./transaction.route";
import UserRouter from "./user.route";
import LogRouter from "./log.route";
import AuthRouter from "./auth.route";

import express from "express";
import errorHandler from "../middlewares/errorHandler";
import authentication from "../middlewares/authentication";

const router = express.Router();

router.post("/auth", AuthRouter);

router.use(authentication);

router.use("/users", UserRouter);
router.use("/logs", LogRouter);
router.use("/products", ProductRouter);
router.use("/transactions", TransactionRouter);

router.use(errorHandler);

export default router;
