import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class CustomerController {
  static async getCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const customers = await prisma.customer.findMany({
        include: {
          transactions: {
            select: {
              id: true,
              total: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 5,
          },
          _count: {
            select: {
              transactions: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      const formattedCustomers = customers.map((customer) => ({
        ...customer,
        transactions: customer.transactions.map((transaction) => ({
          ...transaction,
          createdAt: transaction.createdAt.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
        })),
      }));

      res.status(200).json({
        message: "Customers retrieved successfully",
        data: formattedCustomers,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, phone } = req.body;

      if (!name || name.trim() === "") {
        throw { name: "BadRequest", message: "Customer name is required" };
      }

      if (phone && phone.trim() !== "") {
        const phoneRegex = /^(\+62|62|0)[0-9]{8,12}$/;
        if (!phoneRegex.test(phone.trim().replace(/[\s-]/g, ""))) {
          throw { name: "BadRequest", message: "Invalid phone number format" };
        }

        const existingPhoneCustomer = await prisma.customer.findFirst({
          where: { phone: phone.trim() },
        });

        if (existingPhoneCustomer) {
          throw { name: "Conflict", message: "Phone number already exists" };
        }
      }

      const customer = await prisma.customer.create({
        data: {
          name: name,
          phone: phone && phone.trim() !== "" ? phone.trim() : null,
        },
        include: {
          _count: {
            select: {
              transactions: true,
            },
          },
        },
      });

      res.status(201).json({
        message: "Customer created successfully",
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  static async editCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, phone } = req.body;

      if (!id || isNaN(Number(id))) {
        throw { name: "BadRequest", message: "Invalid customer ID" };
      }

      const existingCustomer = await prisma.customer.findUnique({
        where: { id: Number(id) },
      });

      if (!existingCustomer) {
        throw { name: "NotFound", message: "Customer not found" };
      }

      if (name !== undefined && (!name || name.trim() === "")) {
        throw { name: "BadRequest", message: "Customer name is required" };
      }

      if (phone !== undefined && phone.trim() !== "") {
        const phoneRegex = /^(\+62|62|0)[0-9]{8,12}$/;
        if (!phoneRegex.test(phone.trim().replace(/[\s-]/g, ""))) {
          throw { name: "BadRequest", message: "Invalid phone number format" };
        }

        const existingPhoneCustomer = await prisma.customer.findFirst({
          where: {
            phone: phone.trim(),
            NOT: { id: Number(id) },
          },
        });

        if (existingPhoneCustomer) {
          throw { name: "Conflict", message: "Phone number already exists" };
        }
      }

      const updatedCustomer = await prisma.customer.update({
        where: { id: Number(id) },
        data: {
          ...(name !== undefined && { name: name.trim() }),
          ...(phone !== undefined && {
            phone: phone.trim() !== "" ? phone.trim() : null,
          }),
        },
        include: {
          _count: {
            select: {
              transactions: true,
            },
          },
        },
      });

      res.status(200).json({
        message: "Customer updated successfully",
        data: updatedCustomer,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        throw { name: "BadRequest", message: "Invalid customer ID" };
      }

      const existingCustomer = await prisma.customer.findUnique({
        where: { id: Number(id) },
        include: {
          _count: {
            select: {
              transactions: true,
            },
          },
        },
      });

      if (!existingCustomer) {
        throw { name: "NotFound", message: "Customer not found" };
      }

      if (existingCustomer._count.transactions > 0) {
        throw {
          name: "Conflict",
          message:
            "Cannot delete customer that has transaction history. Consider deactivating instead.",
        };
      }

      await prisma.customer.delete({
        where: { id: Number(id) },
      });

      res.status(200).json({
        message: "Customer deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        throw { name: "BadRequest", message: "Invalid customer ID" };
      }

      const customer = await prisma.customer.findUnique({
        where: { id: Number(id) },
        include: {
          transactions: {
            include: {
              details: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      price: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          _count: {
            select: {
              transactions: true,
            },
          },
        },
      });

      if (!customer) {
        throw { name: "NotFound", message: "Customer not found" };
      }

      const formattedCustomer = {
        ...customer,
        transactions: customer.transactions.map((transaction) => ({
          ...transaction,
          createdAt: transaction.createdAt.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
        })),
      };

      res.status(200).json({
        message: "Customer retrieved successfully",
        data: formattedCustomer,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CustomerController;
