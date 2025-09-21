import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class ProductController {
  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, price, stock, categoryId } = req.body;

      if (!name || !price || !stock || !categoryId) {
        throw { name: "BadRequest", message: "All fields are required" };
      }

      if (!req.loginInfo?.userId) {
        throw { name: "Unauthorized", message: "User must be logged in" };
      }

      if (price <= 0 || stock < 0) {
        throw {
          name: "BadRequest",
          message: "Price must be positive and stock cannot be negative",
        };
      }

      const categoryExists = await prisma.category.findUnique({
        where: { id: Number(categoryId) },
      });

      if (!categoryExists) {
        throw { name: "NotFound", message: "Category not found" };
      }

      const existingProduct = await prisma.product.findFirst({
        where: { name },
      });

      if (existingProduct) {
        throw { name: "Conflict", message: "Product name already exists" };
      }

      const product = await prisma.product.create({
        data: {
          name,
          price: Number(price),
          stock: Number(stock),
          categoryId: Number(categoryId),
          createdById: req.loginInfo?.userId,
        },
        include: {
          category: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      await prisma.log.create({
        data: {
          action: "CREATE_PRODUCT",
          entity: "product",
          userId: req.loginInfo.userId,
        },
      });

      res.status(201).json({
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await prisma.product.findMany({
        include: {
          category: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const formattedProducts = products.map((product) => ({
        ...product,
        createdAt: product.createdAt.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      }));

      res.status(200).json({
        message: "Products retrieved successfully",
        data: formattedProducts,
      });
    } catch (error) {
      next(error);
    }
  }

  static async editProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, price, stock, categoryId } = req.body;

      if (!req.loginInfo?.userId) {
        throw { name: "Unauthorized", message: "User must be logged in" };
      }

      if (!id || isNaN(Number(id))) {
        throw { name: "BadRequest", message: "Invalid product ID" };
      }

      const existingProduct = await prisma.product.findUnique({
        where: { id: Number(id) },
      });

      if (!existingProduct) {
        throw { name: "NotFound", message: "Product not found" };
      }

      if (price !== undefined && price <= 0) {
        throw { name: "BadRequest", message: "Price must be positive" };
      }

      if (stock !== undefined && stock < 0) {
        throw { name: "BadRequest", message: "Stock cannot be negative" };
      }

      if (categoryId) {
        const categoryExists = await prisma.category.findUnique({
          where: { id: Number(categoryId) },
        });

        if (!categoryExists) {
          throw { name: "NotFound", message: "Category not found" };
        }
      }

      if (name && name !== existingProduct.name) {
        const nameExists = await prisma.product.findFirst({
          where: {
            name,
            NOT: { id: Number(id) },
          },
        });

        if (nameExists) {
          throw { name: "Conflict", message: "Product name already exists" };
        }
      }

      const updatedProduct = await prisma.product.update({
        where: { id: Number(id) },
        data: {
          ...(name && { name }),
          ...(price !== undefined && { price: Number(price) }),
          ...(stock !== undefined && { stock: Number(stock) }),
          ...(categoryId && { categoryId: Number(categoryId) }),
        },
        include: {
          category: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      await prisma.log.create({
        data: {
          action: "UPDATE_PRODUCT",
          entity: "product",
          userId: req.loginInfo.userId,
        },
      });

      res.status(200).json({
        message: "Product updated successfully",
        data: updatedProduct,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!req.loginInfo?.userId) {
        throw { name: "Unauthorized", message: "User must be logged in" };
      }

      if (!id || isNaN(Number(id))) {
        throw { name: "BadRequest", message: "Invalid product ID" };
      }

      const existingProduct = await prisma.product.findUnique({
        where: { id: Number(id) },
      });

      if (!existingProduct) {
        throw { name: "NotFound", message: "Product not found" };
      }

      // Check if product is used in any transactions
      const transactionDetail = await prisma.transactionDetail.findFirst({
        where: { productId: Number(id) },
      });

      if (transactionDetail) {
        throw {
          name: "Conflict",
          message: "Cannot delete product that has been used in transactions",
        };
      }

      await prisma.product.delete({
        where: { id: Number(id) },
      });

      await prisma.log.create({
        data: {
          action: "DELETE_PRODUCT",
          entity: "product",
          userId: req.loginInfo.userId,
        },
      });

      res.status(200).json({
        message: "Product deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async totalProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const totalProducts = await prisma.product.count();
      const totalValue = await prisma.product.aggregate({
        _sum: {
          price: true,
          stock: true,
        },
      });

      res.status(200).json({
        message: "Product statistics retrieved successfully",
        data: {
          totalProducts,
          totalValue: totalValue._sum.price || 0,
          totalStock: totalValue._sum.stock || 0,
        },
      });
    } catch (error) {
      console.log(error);

      next(error);
    }
  }
}

export default ProductController;
