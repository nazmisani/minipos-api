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
      });
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
}

export default AuthController;
