import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { hashPassword } from "../helpers/bcrypt";

const prisma = new PrismaClient();

class UserController {
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, role, password } = req.body;

      if (!name || !email || !role || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const existingEmail = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (existingEmail) {
        return res.status(409).json({ message: "Email already in use" });
      }

      const hashedPassword = hashPassword(password);

      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword },
      });

      res.status(201).json({
        message: "register success",
        data: {
          id: user.id,
          name: user.name,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  static async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      const formattedUsers = user.map((u) => ({
        ...u,
        createdAt: u.createdAt.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      }));

      res.status(200).json({ users: formattedUsers });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
