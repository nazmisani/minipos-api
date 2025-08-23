import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
        createdAt: transaction.createdAt.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
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

      let totalAmount = 0;
      const processedDetails: any[] = [];

      for (const detail of details) {
        const { productId, quantity } = detail;

        if (!productId || !quantity || quantity <= 0) {
          throw { name: "BadRequest", message: "Invalid product or quantity" };
        }

        const product = await prisma.product.findUnique({
          where: { id: parseInt(productId) },
        });

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
}

export default TransactionController;
