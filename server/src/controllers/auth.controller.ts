import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { comparePassword } from "../helpers/bcrypt";
import { signToken } from "../helpers/jwt";

const prisma = new PrismaClient();

class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) throw { name: "BadRequest" };

      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!user) throw { name: "LoginErrorUser" };

      if (!comparePassword(password, user.password)) {
        throw { name: "LoginErrorPass" };
      }

      const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      const token = signToken(payload);

      res.cookie("token", token, {
        httpOnly: false, // gak bisa diakses JS → lebih aman
        secure: false, // kalau production, pakai HTTPS
        sameSite: "lax", // cegah CSRF
        maxAge: 24 * 60 * 60 * 1000, // 1 hari
      });

      res.status(201).json({
        token: token,
        role: user.role,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("token", {
        httpOnly: false,
        secure: false, // di production ubah ke true + pakai HTTPS
        sameSite: "lax",
        path: "/",
      });

      res.status(200).json({ message: "Logout success" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({
        message: "User profile",
        user: req.loginInfo,
      });
    } catch (error) {
      console.log(">>>>>", error);
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const userId = req.loginInfo?.userId;

      // Validasi input wajib
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw { name: "BadRequest", message: "All fields are required" };
      }

      if (!userId) {
        throw { name: "Unauthorized", message: "User must be logged in" };
      }

      // Validasi konfirmasi password (2x input)
      if (newPassword !== confirmPassword) {
        throw {
          name: "BadRequest",
          message: "New password and confirm password do not match",
        };
      }

      // Validasi password tidak boleh sama dengan current password
      if (currentPassword === newPassword) {
        throw {
          name: "BadRequest",
          message: "New password must be different from current password",
        };
      }

      // Validasi panjang password
      if (newPassword.length < 6) {
        throw {
          name: "BadRequest",
          message: "Password must be at least 6 characters",
        };
      }

      // Validasi password strength (opsional - bisa ditambah sesuai kebutuhan)
      const hasUpperCase = /[A-Z]/.test(newPassword);
      const hasLowerCase = /[a-z]/.test(newPassword);
      const hasNumber = /\d/.test(newPassword);

      if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        throw {
          name: "BadRequest",
          message:
            "Password must contain at least one uppercase letter, lowercase letter, and number",
        };
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }

      if (!comparePassword(currentPassword, user.password)) {
        throw { name: "BadRequest", message: "Current password is incorrect" };
      }

      const { hashPassword } = require("../helpers/bcrypt");
      const hashedNewPassword = hashPassword(newPassword);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      await prisma.log.create({
        data: {
          action: "CHANGE_PASSWORD",
          entity: "user",
          userId: userId,
        },
      });

      res.status(200).json({
        message: "Password changed successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
