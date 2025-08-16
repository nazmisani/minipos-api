import express from "express";
import UserController from "../controllers/user.controller";
import { authorizeRole } from "../middlewares/authorization";
const router = express.Router();

// router.use(authorizeRole("admin"));

// router.get("/");
router.post("/", UserController.createUser);
// router.put("/:id");
// router.delete("/:id");

export default router;
