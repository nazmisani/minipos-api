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
    data: [
      { name: "Beverages" },
      { name: "Snacks" },
      { name: "Electronics" },
      { name: "Food & Meals" },
      { name: "Personal Care" },
      { name: "Stationery" },
      { name: "Household Items" },
      { name: "Frozen Foods" },
    ],
  });

  // Products → tambahin createdById (Super Admin = userId: 1)
  await prisma.product.createMany({
    data: [
      // Beverages (Category 1)
      {
        name: "Coca Cola",
        price: 10000,
        stock: 50,
        categoryId: 1,
        createdById: 1,
      },
      {
        name: "Pepsi",
        price: 9500,
        stock: 45,
        categoryId: 1,
        createdById: 1,
      },
      {
        name: "Mineral Water",
        price: 3000,
        stock: 100,
        categoryId: 1,
        createdById: 1,
      },
      {
        name: "Orange Juice",
        price: 12000,
        stock: 30,
        categoryId: 1,
        createdById: 1,
      },

      // Snacks (Category 2)
      {
        name: "Potato Chips",
        price: 15000,
        stock: 40,
        categoryId: 2,
        createdById: 1,
      },
      {
        name: "Chocolate Bar",
        price: 8000,
        stock: 60,
        categoryId: 2,
        createdById: 1,
      },
      {
        name: "Cookies",
        price: 12000,
        stock: 35,
        categoryId: 2,
        createdById: 1,
      },

      // Electronics (Category 3)
      {
        name: "Bluetooth Speaker",
        price: 250000,
        stock: 20,
        categoryId: 3,
        createdById: 1,
      },
      {
        name: "Power Bank",
        price: 150000,
        stock: 25,
        categoryId: 3,
        createdById: 1,
      },
      {
        name: "USB Cable",
        price: 25000,
        stock: 80,
        categoryId: 3,
        createdById: 1,
      },

      // Food & Meals (Category 4)
      {
        name: "Instant Noodles",
        price: 5000,
        stock: 120,
        categoryId: 4,
        createdById: 1,
      },
      {
        name: "Sandwich",
        price: 18000,
        stock: 15,
        categoryId: 4,
        createdById: 1,
      },
      {
        name: "Rice Box",
        price: 25000,
        stock: 10,
        categoryId: 4,
        createdById: 1,
      },

      // Personal Care (Category 5)
      {
        name: "Toothpaste",
        price: 12000,
        stock: 40,
        categoryId: 5,
        createdById: 1,
      },
      {
        name: "Shampoo",
        price: 35000,
        stock: 25,
        categoryId: 5,
        createdById: 1,
      },
      {
        name: "Hand Sanitizer",
        price: 8000,
        stock: 70,
        categoryId: 5,
        createdById: 1,
      },

      // Stationery (Category 6)
      {
        name: "Pen",
        price: 3000,
        stock: 150,
        categoryId: 6,
        createdById: 1,
      },
      {
        name: "Notebook",
        price: 15000,
        stock: 50,
        categoryId: 6,
        createdById: 1,
      },

      // Household Items (Category 7)
      {
        name: "Tissue Box",
        price: 8000,
        stock: 60,
        categoryId: 7,
        createdById: 1,
      },

      // Frozen Foods (Category 8)
      {
        name: "Ice Cream",
        price: 12000,
        stock: 25,
        categoryId: 8,
        createdById: 1,
      },
    ],
  });

  // Customers
  await prisma.customer.createMany({
    data: [
      { name: "John Doe", phone: "08123456789" },
      { name: "Jane Smith", phone: "08234567890" },
      { name: "Ahmad Rizki", phone: "08135551234" },
      { name: "Sarah Johnson", phone: "08567891011" },
      { name: "Michael Chen", phone: "08198765432" },
      { name: "Diana Putri", phone: "08147258369" },
    ],
  });

  // Sample Transactions
  // Transaction 1
  await prisma.transaction.create({
    data: {
      total: 35000,
      userId: 2, // Cashier 1
      customerId: 1, // John Doe
      details: {
        create: [
          { productId: 1, quantity: 2, subTotal: 20000 }, // Coca Cola x2
          { productId: 5, quantity: 1, subTotal: 15000 }, // Potato Chips x1
        ],
      },
    },
  });

  // Transaction 2
  await prisma.transaction.create({
    data: {
      total: 47000,
      userId: 2, // Cashier 1
      customerId: 2, // Jane Smith
      details: {
        create: [
          { productId: 3, quantity: 3, subTotal: 9000 }, // Mineral Water x3
          { productId: 6, quantity: 2, subTotal: 16000 }, // Chocolate Bar x2
          { productId: 11, quantity: 2, subTotal: 10000 }, // Instant Noodles x2
          { productId: 14, quantity: 1, subTotal: 12000 }, // Toothpaste x1
        ],
      },
    },
  });

  // Transaction 3
  await prisma.transaction.create({
    data: {
      total: 280000,
      userId: 3, // Manager 1
      customerId: 3, // Ahmad Rizki
      details: {
        create: [
          { productId: 8, quantity: 1, subTotal: 250000 }, // Bluetooth Speaker x1
          { productId: 10, quantity: 1, subTotal: 25000 }, // USB Cable x1
          { productId: 1, quantity: 1, subTotal: 10000 }, // Coca Cola x1 (bonus)
        ],
      },
    },
  });

  // Transaction 4 - No customer
  await prisma.transaction.create({
    data: {
      total: 23000,
      userId: 2, // Cashier 1
      customerId: null, // Walk-in customer
      details: {
        create: [
          { productId: 4, quantity: 1, subTotal: 12000 }, // Orange Juice x1
          { productId: 17, quantity: 2, subTotal: 6000 }, // Pen x2
          { productId: 16, quantity: 1, subTotal: 8000 }, // Hand Sanitizer x1
        ],
      },
    },
  });

  // Logs for transactions
  await prisma.log.createMany({
    data: [
      { action: "CREATE_TRANSACTION", entity: "transaction", userId: 2 },
      { action: "CREATE_TRANSACTION", entity: "transaction", userId: 2 },
      { action: "CREATE_TRANSACTION", entity: "transaction", userId: 3 },
      { action: "CREATE_TRANSACTION", entity: "transaction", userId: 2 },
    ],
  });

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
