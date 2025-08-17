import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { hashPassword } from "../helpers/bcrypt";

const prisma = new PrismaClient();

class UserController {
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, role, password } = req.body;

      if (!name || !email || !role || !password) {
        throw { name: "BadRequest", message: "All fields are required" };
      }

      if (!req.loginInfo || req.loginInfo.role !== "admin") {
        throw {
          name: "Forbidden",
          message: "You are not allowed to create users",
        };
      }

      if (
        !req.loginInfo.isSuperAdmin &&
        req.loginInfo.email !== "superadmin@minipos.com" &&
        role === "admin"
      ) {
        throw {
          name: "Forbidden",
          message: "Only superadmin can create new admins",
        };
      }

      const existingEmail = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (existingEmail) {
        throw { name: "Conflict", message: "Email already in use" };
      }

      const hashedPassword = hashPassword(password);

      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role },
      });

      res.status(201).json({
        message: "User created successfully",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.log(error);

      next(error);
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

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, email, role } = req.body;

      if (!id || isNaN(Number(id))) throw { name: "BadRequest" };

      const existingUser = await prisma.user.findUnique({
        where: { id: Number(id) },
      });

      if (!existingUser) throw { name: "NotFound" };

      if (
        (existingUser.isSuperAdmin ||
          existingUser.email === "superadmin@minipos.com") &&
        role
      ) {
        throw { name: "Forbidden", message: "Cannot change superadmin role" };
      }

      if (email && email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email },
        });
        if (emailExists) throw { name: "Conflict" };
      }

      const updatedUser = await prisma.user.update({
        where: { id: Number(id) },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(role &&
            !existingUser.isSuperAdmin &&
            existingUser.email !== "superadmin@minipos.com" && { role }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      res.status(200).json({
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) throw { name: "BadRequest" };

      const existingUser = await prisma.user.findUnique({
        where: { id: Number(id) },
      });

      if (!existingUser) throw { name: "NotFound" };

      if (req.loginInfo && Number(id) === req.loginInfo.userId) {
        throw { name: "BadRequest", message: "Cannot delete your own account" };
      }

      if (
        existingUser.isSuperAdmin ||
        existingUser.email === "superadmin@minipos.com"
      ) {
        throw { name: "Forbidden", message: "Cannot delete superadmin" };
      }

      await prisma.user.delete({
        where: { id: Number(id) },
      });

      res.status(200).json({
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
