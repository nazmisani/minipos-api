import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcryptjs";
async function main() {
  // Hash passwords
  const adminPass = await bcrypt.hash("admin123", 10);
  const cashierPass = await bcrypt.hash("cashier123", 10);
  const managerPass = await bcrypt.hash("manager123", 10);

  // Users
  await prisma.user.createMany({
    data: [
      {
        name: "Admin User",
        email: "admin@example.com",
        password: adminPass,
        role: "admin",
      },
      {
        name: "Cashier One",
        email: "cashier1@example.com",
        password: cashierPass,
        role: "cashier",
      },
      {
        name: "Manager One",
        email: "manager@example.com",
        password: managerPass,
        role: "manager",
      },
    ],
  });

  // Categories
  await prisma.category.createMany({
    data: [{ name: "Beverages" }, { name: "Snacks" }, { name: "Electronics" }],
  });

  // Products
  await prisma.product.createMany({
    data: [
      { name: "Coca Cola", price: 10000, stock: 50, categoryId: 1 },
      { name: "Potato Chips", price: 15000, stock: 40, categoryId: 2 },
      { name: "Bluetooth Speaker", price: 250000, stock: 20, categoryId: 3 },
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
