import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/helpers/bcrypt";
const prisma = new PrismaClient();

async function main() {
  // Hash passwords
  const adminPass = hashPassword(process.env.ADMIN_PASSWORD ?? "password");
  const cashierPass = hashPassword(process.env.CASHIER_PASSWORD ?? "password");
  const managerPass = hashPassword(process.env.MANAGER_PASSWORD ?? "password");

  // Users
  await prisma.user.createMany({
    data: [
      {
        name: "Super Admin",
        email: "superadmin@minipos.com",
        password: adminPass,
        role: "admin",
        isSuperAdmin: true,
      },
      {
        name: "Cashier 1",
        email: "cashier1@gmail.com",
        password: cashierPass,
        role: "cashier",
        isSuperAdmin: false,
      },
      {
        name: "Manager 1",
        email: "manager1@gmail.com",
        password: managerPass,
        role: "manager",
        isSuperAdmin: false,
      },
    ],
  });

  // Categories
  await prisma.category.createMany({
    data: [{ name: "Beverages" }, { name: "Snacks" }, { name: "Electronics" }],
  });

  // Products → tambahin createdById (Super Admin = userId: 1)
  await prisma.product.createMany({
    data: [
      {
        name: "Coca Cola",
        price: 10000,
        stock: 50,
        categoryId: 1,
        createdById: 1,
      },
      {
        name: "Potato Chips",
        price: 15000,
        stock: 40,
        categoryId: 2,
        createdById: 1,
      },
      {
        name: "Bluetooth Speaker",
        price: 250000,
        stock: 20,
        categoryId: 3,
        createdById: 1,
      },
    ],
  });

  // Customers
  await prisma.customer.createMany({
    data: [
      { name: "John Doe", phone: "08123456789", email: "john@example.com" },
      { name: "Jane Smith", phone: "08234567890", email: "jane@example.com" },
    ],
  });

  // Transaction + Details
  await prisma.transaction.create({
    data: {
      total: 35000,
      userId: 2, // Cashier One
      customerId: 1, // John Doe
      details: {
        create: [
          { productId: 1, quantity: 2, subTotal: 20000 },
          { productId: 2, quantity: 1, subTotal: 15000 },
        ],
      },
    },
  });

  // Log
  await prisma.log.create({
    data: { action: "CREATE_TRANSACTION", entity: "transaction", userId: 2 },
  });

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
