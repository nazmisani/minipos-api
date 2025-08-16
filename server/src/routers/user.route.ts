import express from "express";
import UserController from "../controllers/user.controller";
import { authorizeRole } from "../middlewares/authorization";
const router = express.Router();

router.use(authorizeRole("admin"));

router.get("/", UserController.getUser);
router.post("/", UserController.createUser);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

export default router;
