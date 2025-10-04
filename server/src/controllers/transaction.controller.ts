import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/db";

class TransactionController {
  static async getTransactions(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const transactions = await prisma.transaction.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          details: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const formattedTransactions = transactions.map((transaction) => ({
        ...transaction,
        createdAt: transaction.createdAt.toLocaleDateString("en-EN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      }));

      res.status(200).json({
        message: "Transactions retrieved successfully",
        data: formattedTransactions,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createTransaction(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { customerId, details } = req.body;
      const userId = req.loginInfo?.userId;

      if (!details || !Array.isArray(details) || details.length === 0) {
        throw {
          name: "BadRequest",
          message: "Transaction details are required",
        };
      }

      // Validate customer if provided
      if (customerId) {
        const customer = await prisma.customer.findUnique({
          where: { id: parseInt(customerId) },
        });

        if (!customer) {
          throw {
            name: "NotFound",
            message: "Customer not found",
          };
        }
      }

      // ✅ OPTIMIZED: Fetch all products at once instead of N+1 queries
      const productIds = details.map((detail) => parseInt(detail.productId));

      // Validate all product IDs first
      for (const detail of details) {
        const { productId, quantity } = detail;
        if (!productId || !quantity || quantity <= 0) {
          throw { name: "BadRequest", message: "Invalid product or quantity" };
        }
      }

      // Single query to fetch all required products
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, price: true, stock: true },
      });

      // Create product map for O(1) lookup
      const productMap = new Map(products.map((p) => [p.id, p]));

      let totalAmount = 0;
      const processedDetails: any[] = [];

      // Process details with products from map
      for (const detail of details) {
        const { productId, quantity } = detail;
        const product = productMap.get(parseInt(productId));

        if (!product) {
          throw {
            name: "NotFound",
            message: `Product with ID ${productId} not found`,
          };
        }

        if (product.stock < quantity) {
          throw {
            name: "BadRequest",
            message: `Insufficient stock for ${product.name}`,
          };
        }

        const subTotal = product.price * quantity;
        totalAmount += subTotal;

        processedDetails.push({
          productId: parseInt(productId),
          quantity: parseInt(quantity),
          subTotal,
        });
      }

      if (!userId) {
        throw { name: "Unauthorized", message: "User not authenticated" };
      }

      const transaction = await prisma.$transaction(async (prisma) => {
        const newTransaction = await prisma.transaction.create({
          data: {
            total: totalAmount,
            userId,
            customerId: customerId ? parseInt(customerId) : null,
            details: {
              create: processedDetails,
            },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
            customer: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
            details: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                  },
                },
              },
            },
          },
        });

        for (const detail of processedDetails) {
          await prisma.product.update({
            where: { id: detail.productId },
            data: {
              stock: {
                decrement: detail.quantity,
              },
            },
          });
        }

        await prisma.log.create({
          data: {
            action: "CREATE_TRANSACTION",
            entity: "transaction",
            userId,
          },
        });

        return newTransaction;
      });

      res.status(201).json({
        message: "Transaction created successfully",
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      const transaction = await prisma.transaction.findUnique({
        where: { id: Number(id) },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          details: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  category: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!transaction) {
        throw { name: "NotFound", message: "Transaction not found" };
      }

      const formattedTransaction = {
        ...transaction,
        createdAt: transaction.createdAt.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      res.status(200).json({
        message: "Transaction retrieved successfully",
        data: formattedTransaction,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTransaction(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      const existingTransaction = await prisma.transaction.findUnique({
        where: { id: Number(id) },
        include: {
          details: true,
        },
      });

      if (!existingTransaction) {
        throw { name: "NotFound", message: "Transaction not found" };
      }

      await prisma.$transaction(async (prisma) => {
        for (const detail of existingTransaction.details) {
          await prisma.product.update({
            where: { id: detail.productId },
            data: {
              stock: {
                increment: detail.quantity,
              },
            },
          });
        }

        await prisma.transaction.delete({
          where: { id: Number(id) },
        });

        await prisma.log.create({
          data: {
            action: "DELETE_TRANSACTION",
            entity: "transaction",
            userId: req.loginInfo?.userId || 0,
          },
        });
      });

      res.status(200).json({
        message: "Transaction deleted successfully",
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async getTodaysTransactions(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
      );

      const todaysTransactions = await prisma.transaction.findMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          details: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const totalAmount = todaysTransactions.reduce(
        (sum, transaction) => sum + transaction.total,
        0
      );
      const totalCount = todaysTransactions.length;

      const formattedTransactions = todaysTransactions.map((transaction) => ({
        ...transaction,
        createdAt: transaction.createdAt.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      res.status(200).json({
        message: "Today's transactions retrieved successfully",
        data: {
          transactions: formattedTransactions,
          summary: {
            totalCount,
            totalAmount,
            date: today.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default TransactionController;
