import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../helpers/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) throw { name: "Unauthorized" };

    const token = authorization.split(" ")[1];

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
    };

    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export default authentication;
