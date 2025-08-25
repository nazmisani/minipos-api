import express from "express";
import ReportController from "../controllers/report.controller";
import { authorizeRole } from "../middlewares/authorization";

const router = express.Router();

router.get(
  "/sales",
  authorizeRole("admin", "manager"),
  ReportController.salesReport
);
router.get(
  "/products/top",
  authorizeRole("admin", "manager"),
  ReportController.topProducts
);

export default router;
