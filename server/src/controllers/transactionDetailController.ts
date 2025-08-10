import { NextFunction, Request, Response } from "express";

class TransactionDetailController {
  static async addTransactionDetail(
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

export default TransactionDetailController;
