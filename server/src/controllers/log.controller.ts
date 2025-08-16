import { NextFunction, Request, Response } from "express";

class ProductController {
  static async getLog(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (error) {
      next(error);
    }
  }
}

export default ProductController;
