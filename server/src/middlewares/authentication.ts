import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../helpers/jwt";
import { prisma } from "../lib/db";

const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = req.headers;

    let token = authorization?.split(" ")[1];
    if (!token) {
      token = req.cookies?.token;
    }

    if (!token) throw { name: "Unauthorized" };

    const payload = verifyToken(token);

    if (typeof payload === "string") {
      throw { name: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (!user) throw { name: "Unauthorized" };

    req.loginInfo = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
    };

    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export default authentication;
