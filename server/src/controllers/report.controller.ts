import { NextFunction, Request, Response } from "express";
import dayjs from "dayjs";
import { prisma } from "../lib/db";

class ReportController {
  static async salesReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { start, end, group = "day" } = req.query;

      // ✅ OPTIMIZED: Database-level aggregation instead of JavaScript grouping
      let dateFormat = "YYYY-MM-DD";
      let sqlDateFormat = "YYYY-MM-DD";

      if (group === "month") {
        dateFormat = "YYYY-MM";
        sqlDateFormat = "YYYY-MM";
      }

      const whereClause = [];
      const params: any[] = [];

      if (start) {
        whereClause.push(`"createdAt" >= $${params.length + 1}`);
        params.push(new Date(String(start)));
      }

      if (end) {
        whereClause.push(`"createdAt" <= $${params.length + 1}`);
        params.push(new Date(String(end)));
      }

      const whereString =
        whereClause.length > 0 ? `WHERE ${whereClause.join(" AND ")}` : "";

      const salesData = await prisma.$queryRawUnsafe(
        `
        SELECT 
          TO_CHAR("createdAt", '${sqlDateFormat}') as date,
          SUM(total)::int as "totalSales",
          COUNT(*)::int as "totalTransactions"
        FROM "Transaction"
        ${whereString}
        GROUP BY TO_CHAR("createdAt", '${sqlDateFormat}')
        ORDER BY date ASC
      `,
        ...params
      );

      res.json({ message: "success", data: salesData });
    } catch (error) {
      next(error);
    }
  }

  static async topProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = 10 } = req.query;

      // ✅ OPTIMIZED: Single query with proper aggregation and join
      const topProducts = await prisma.$queryRaw`
        SELECT 
          p.id,
          p.name,
          p.price,
          SUM(td.quantity)::int as total_quantity,
          SUM(td."subTotal")::int as total_revenue,
          COUNT(td.id)::int as order_count
        FROM "TransactionDetail" td
        INNER JOIN "Product" p ON td."productId" = p.id
        GROUP BY p.id, p.name, p.price
        ORDER BY total_quantity DESC
        LIMIT ${Number(limit)}
      `;

      res.json({ message: "success", data: topProducts });
    } catch (error) {
      next(error);
    }
  }
}

export default ReportController;
