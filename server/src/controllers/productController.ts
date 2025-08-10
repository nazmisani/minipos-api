import { NextFunction, Request, Response } from "express";

class ProductController {
  static async addProduct(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (error) {
      console.log(error);
    }
  }
}

export default ProductController;
