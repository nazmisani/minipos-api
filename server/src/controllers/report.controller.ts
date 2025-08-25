import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import dayjs from "dayjs";

const prisma = new PrismaClient();

class ReportController {
  static async salesReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { start, end, group = "day" } = req.query;

      const transactions = await prisma.transaction.findMany({
        where: {
          createdAt: {
            gte: start ? new Date(String(start)) : undefined,
            lte: end ? new Date(String(end)) : undefined,
          },
        },
        select: {
          createdAt: true,
          total: true,
        },
      });

      const grouped: Record<
        string,
        { totalSales: number; totalTransactions: number }
      > = {};

      transactions.forEach((t) => {
        const dateKey =
          group === "month"
            ? dayjs(t.createdAt).format("YYYY-MM")
            : dayjs(t.createdAt).format("YYYY-MM-DD");

        if (!grouped[dateKey]) {
          grouped[dateKey] = { totalSales: 0, totalTransactions: 0 };
        }
        grouped[dateKey].totalSales += t.total;
        grouped[dateKey].totalTransactions += 1;
      });

      const result = Object.entries(grouped).map(([date, data]) => ({
        date,
        ...data,
      }));

      res.json({ message: "success", data: result });
    } catch (error) {
      next(error);
    }
  }

  static async topProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = 10 } = req.query;

      const result = await prisma.transactionDetail.groupBy({
        by: ["productId"],
        _sum: { quantity: true, subTotal: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: Number(limit),
      });

      const products = await prisma.product.findMany({
        where: { id: { in: result.map((r) => r.productId) } },
        select: { id: true, name: true, price: true },
      });

      const data = result.map((r) => ({
        ...r,
        product: products.find((p) => p.id === r.productId),
      }));

      res.json({ message: "success", data });
    } catch (error) {
      next(error);
    }
  }
}

export default ReportController;
