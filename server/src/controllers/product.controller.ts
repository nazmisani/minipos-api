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
      console.log(error);

      next(error);
    }
  }

  static async getProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      // Validate and parse pagination parameters
      const pageNumber = Math.max(1, parseInt(String(page)));
      const limitNumber = Math.min(50, Math.max(1, parseInt(String(limit)))); // Max 50 items per page
      const skip = (pageNumber - 1) * limitNumber;

      // Build where conditions
      const whereConditions: any = {};
      if (category) {
        whereConditions.categoryId = parseInt(String(category));
      }

      // Validate sortBy parameter
      const validSortFields = ["createdAt", "name", "price", "stock"];
      const sortField = validSortFields.includes(String(sortBy))
        ? String(sortBy)
        : "createdAt";
      const sortDirection = sortOrder === "asc" ? "asc" : "desc";

      // Execute queries in parallel for better performance
      const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
          where: whereConditions,
          include: {
            category: true,
          },
          orderBy: {
            [sortField]: sortDirection,
          },
          take: limitNumber,
          skip: skip,
        }),
        prisma.product.count({
          where: whereConditions,
        }),
      ]);

      const formattedProducts = products.map((product) => ({
        ...product,
        createdAt: product.createdAt.toLocaleDateString("en-EN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        inStock: product.stock > 0,
      }));

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limitNumber);
      const hasNextPage = pageNumber < totalPages;
      const hasPrevPage = pageNumber > 1;

      res.status(200).json({
        message: "Products retrieved successfully",
        data: formattedProducts,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: limitNumber,
          showing: `${skip + 1}-${Math.min(
            skip + limitNumber,
            totalCount
          )} of ${totalCount}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        throw { name: "BadRequest", message: "Invalid product ID" };
      }

      const product = await prisma.product.findUnique({
        where: { id: Number(id) },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              transactionDetails: true,
            },
          },
        },
      });

      if (!product) {
        throw { name: "NotFound", message: "Product not found" };
      }

      const formattedProduct = {
        ...product,
        createdAt: product.createdAt.toLocaleDateString("en-EN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      };

      res.status(200).json({
        message: "Product retrieved successfully",
        data: formattedProduct,
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

  static async searchProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        q, // search query
        category, // category filter
        minPrice,
        maxPrice,
        inStock, // boolean - only products with stock > 0
        limit = 20,
        page = 1,
      } = req.query;

      // Build where conditions
      const whereConditions: any = {};

      // Search by product name (case insensitive)
      if (q) {
        whereConditions.name = {
          contains: String(q),
          mode: "insensitive",
        };
      }

      // Filter by category
      if (category) {
        whereConditions.categoryId = parseInt(String(category));
      }

      // Price range filter
      if (minPrice || maxPrice) {
        whereConditions.price = {};
        if (minPrice) whereConditions.price.gte = parseInt(String(minPrice));
        if (maxPrice) whereConditions.price.lte = parseInt(String(maxPrice));
      }

      // Only products in stock
      if (inStock === "true") {
        whereConditions.stock = { gt: 0 };
      }

      // Calculate pagination
      const take = parseInt(String(limit));
      const skip = (parseInt(String(page)) - 1) * take;

      // Execute search with count for pagination
      const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
          where: whereConditions,
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: [
            { stock: "desc" }, // Products in stock first
            { name: "asc" }, // Then alphabetically
          ],
          take,
          skip,
        }),
        prisma.product.count({
          where: whereConditions,
        }),
      ]);

      // Format response
      const formattedProducts = products.map((product) => ({
        ...product,
        createdAt: product.createdAt.toLocaleDateString("en-EN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        inStock: product.stock > 0,
      }));

      // Pagination info
      const totalPages = Math.ceil(totalCount / take);
      const currentPage = parseInt(String(page));
      const hasNextPage = currentPage < totalPages;
      const hasPrevPage = currentPage > 1;

      res.status(200).json({
        message: "Product search completed successfully",
        data: formattedProducts,
        pagination: {
          currentPage: parseInt(String(page)),
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: take,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, inStock } = req.query;

      // Build where conditions
      const whereConditions: any = {};

      if (category) {
        whereConditions.categoryId = parseInt(String(category));
      }

      if (inStock === "true") {
        whereConditions.stock = { gt: 0 };
      }

      const products = await prisma.product.findMany({
        where: whereConditions,
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { stock: "desc" }, // Products in stock first
          { name: "asc" }, // Then alphabetically
        ],
      });

      const formattedProducts = products.map((product) => ({
        ...product,
        inStock: product.stock > 0,
      }));

      res.status(200).json({
        message: "All products retrieved successfully",
        data: formattedProducts,
        count: products.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ProductController;
