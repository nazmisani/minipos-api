import express from "express";
import UserController from "../controllers/user.controller";
const router = express.Router();

router.get("/");
router.post("/", UserController.createUser);
router.put("/:id");
router.delete("/:id");

export default router;
