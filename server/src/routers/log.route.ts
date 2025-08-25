import express from "express";
import LogController from "../controllers/log.controller";
import { authorizeRole } from "../middlewares/authorization";

const router = express.Router();

router.get("/", authorizeRole("admin"), LogController.getLogs);

export default router;
