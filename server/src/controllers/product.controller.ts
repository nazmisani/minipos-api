import { NextFunction, Request, Response } from "express";

class ProductController {
  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.loginInfo?.userId;
      console.log(userId);
    } catch (error) {
      next(error);
    }
  }
}

export default ProductController;
