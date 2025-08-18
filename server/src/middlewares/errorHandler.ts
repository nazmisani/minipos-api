import { Request, Response, NextFunction } from "express";

const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let status = 500;
  let message = "Internal Server Error";

  if (error.name === "BadRequest") {
    message = error.message || "Bad request";
    status = 400;
  }

  if (error.name === "Unauthorized" || error.name === "JsonWebTokenError") {
    message = "Please login first";
    status = 401;
  }

  if (error.name === "LoginErrorUser" || error.name === "LoginErrorPass") {
    message = "Invalid email or password";
    status = 401;
  }

  if (error.name === "Forbidden") {
    message = "You dont have any access";
    status = 403;
  }

  if (error.name === "NotFound") {
    status = 404;
    message = "Data not found";
  }

  if (error.name === "Conflict") {
    status = 409;
    message = "Data conflict";
  }

  res.status(status).json({
    message,
  });
};

export default errorHandler;
