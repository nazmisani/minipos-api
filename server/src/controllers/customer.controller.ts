import { NextFunction, Request, Response } from "express";

class customerController {
  static async getLog(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (error) {
      next(error);
    }
  }
}

export default customerController;
