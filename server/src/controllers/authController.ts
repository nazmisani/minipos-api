import { NextFunction, Request, Response } from "express";

class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (error) {
      console.log(error);
    }
  }
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (error) {
      console.log(error);
    }
  }
}

export default AuthController;
