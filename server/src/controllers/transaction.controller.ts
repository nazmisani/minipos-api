import { NextFunction, Request, Response } from "express";

class TransactionController {
  static async createTransaction(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
    } catch (error) {
      console.log(error);
    }
  }
}

export default TransactionController;
