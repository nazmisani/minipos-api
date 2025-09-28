import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class CategoryController {
  static async getCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await prisma.category.findMany({
        orderBy: {
          name: "asc",
        },
      });

      res.status(200).json({
        message: "Categories retrieved successfully",
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;

      if (!name || name.trim() === "") {
        throw { name: "BadRequest", message: "Category name is required" };
      }

      if (!req.loginInfo?.userId) {
        throw { name: "Unauthorized", message: "User must be logged in" };
      }

      const existingCategory = await prisma.category.findUnique({
        where: { name: name.trim() },
      });

      if (existingCategory) {
        throw { name: "Conflict", message: "Category name already exists" };
      }

      const category = await prisma.category.create({
        data: {
          name: name.trim(),
        },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      res.status(201).json({
        message: "Category created successfully",
        data: category,
      });

      await prisma.log.create({
        data: {
          action: "CREATE_CATEGORY",
          entity: "category",
          userId: req.loginInfo.userId,
        },
      });
    } catch (error) {
      console.log(error);

      next(error);
    }
  }

  static async editCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!req.loginInfo?.userId) {
        throw { name: "Unauthorized", message: "User must be logged in" };
      }

      if (!id || isNaN(Number(id))) {
        throw { name: "BadRequest", message: "Invalid category ID" };
      }

      if (!name || name.trim() === "") {
        throw { name: "BadRequest", message: "Category name is required" };
      }

      const existingCategory = await prisma.category.findUnique({
        where: { id: Number(id) },
      });

      if (!existingCategory) {
        throw { name: "NotFound", message: "Category not found" };
      }

      const nameExists = await prisma.category.findFirst({
        where: {
          name: name.trim(),
          NOT: { id: Number(id) },
        },
      });

      if (nameExists) {
        throw { name: "Conflict", message: "Category name already exists" };
      }

      const updatedCategory = await prisma.category.update({
        where: { id: Number(id) },
        data: {
          name: name.trim(),
        },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      res.status(200).json({
        message: "Category updated successfully",
        data: updatedCategory,
      });

      await prisma.log.create({
        data: {
          action: "UPDATE_CATEGORY",
          entity: "category",
          userId: req.loginInfo.userId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        throw { name: "BadRequest", message: "Invalid category ID" };
      }

      if (!req.loginInfo?.userId) {
        throw { name: "Unauthorized", message: "User must be logged in" };
      }

      const existingCategory = await prisma.category.findUnique({
        where: { id: Number(id) },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      if (!existingCategory) {
        throw { name: "NotFound", message: "Category not found" };
      }

      // Check if category has products
      if (existingCategory._count.products > 0) {
        throw {
          name: "Conflict",
          message:
            "Cannot delete category that has products. Please reassign or delete products first.",
        };
      }

      await prisma.category.delete({
        where: { id: Number(id) },
      });

      res.status(200).json({
        message: "Category deleted successfully",
      });

      await prisma.log.create({
        data: {
          action: "DELETE_CATEGORY",
          entity: "category",
          userId: req.loginInfo.userId,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CategoryController;
