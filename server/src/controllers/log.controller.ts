import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/db";

class LogController {
  static async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await prisma.log.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      res.status(200).json({ message: "success", data: logs });
    } catch (error) {
      next(error);
    }
  }
}

export default LogController;
