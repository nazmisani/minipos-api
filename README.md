# 🚀 MiniPOS API

MiniPOS API adalah backend RESTful modern untuk aplikasi kasir/ERP sederhana, dibangun dengan **Node.js (Express + TypeScript)**, **Prisma ORM**, dan **PostgreSQL**.  
Fokus pada clean code, keamanan, dan kemudahan integrasi untuk kebutuhan bisnis retail, toko, atau UMKM.

---

## ✨ Fitur Utama

- **User Management**: Admin, Manager, Cashier, Superadmin (role & permission lengkap)
- **Product & Category**: CRUD produk & kategori, stok otomatis, validasi relasi
- **Customer**: Data customer & riwayat transaksi
- **Transaction**: Proses penjualan, update stok otomatis, histori detail
- **Log/Audit Trail**: Semua aksi penting user tercatat, bisa di-audit
- **Reports & Charts**: Laporan penjualan harian/bulanan, produk terlaris (siap untuk dashboard)
- **JWT Auth**: Keamanan login, role-based access, password hash
- **Error Handling**: Response API konsisten & mudah di-debug

---

## 🗂️ Struktur Project

```
server/
├── prisma/
│   ├── schema.prisma      # Skema database (Prisma)
│   └── seed.ts            # Seeder data awal (user, produk, dsb)
├── src/
│   ├── controllers/       # Semua logic endpoint (modular & clean)
│   ├── routers/           # Routing Express per resource
│   ├── middlewares/       # Auth, error handler, dsb
│   ├── helpers/           # Helper (bcrypt, jwt, dll)
│   └── types/             # TypeScript types
├── .env.example           # Contoh environment variable
├── package.json
└── tsconfig.json
```

---

## ⚡️ Quick Start

1. **Clone & Install**

   ```bash
   git clone https://github.com/nazmisani/minipos-api.git
   cd minipos-api/server
   npm install
   ```

2. **Setup Database**

   - Copy `.env.example` ke `.env` dan isi `DATABASE_URL` PostgreSQL kamu.
   - Jalankan migration & seeder:
     ```bash
     npx prisma migrate dev --name init
     npx prisma db seed
     ```

3. **Run Development**

   ```bash
   npm run dev
   # atau
   bun rundev
   ```

4. **API Ready!**
   - Server: `http://localhost:3000`
   - Cek dokumentasi endpoint di bawah.

---

## 🔐 Auth & Role

- **Login:** `POST /auth/login` → dapatkan JWT token
- **Role:** `admin`, `manager`, `cashier`, `superadmin`
- Semua endpoint pakai JWT di header:  
  `Authorization: Bearer <token>`

---

## 📚 API Endpoints

| Resource     | Endpoint                | Method | Role           | Keterangan                       |
| ------------ | ----------------------- | ------ | -------------- | -------------------------------- |
| Auth         | `/auth/login`           | POST   | All            | Login user                       |
| Auth         | `/auth/profile`         | GET    | All (login)    | Profil user login                |
| Users        | `/users`                | GET    | Admin          | List user                        |
| Users        | `/users`                | POST   | Superadmin     | Tambah user                      |
| Users        | `/users/:id`            | PUT    | Admin          | Edit user                        |
| Users        | `/users/:id`            | DELETE | Admin          | Hapus user                       |
| Products     | `/products`             | GET    | All            | List produk                      |
| Products     | `/products`             | POST   | Admin, Manager | Tambah produk                    |
| Products     | `/products/:id`         | PUT    | Admin, Manager | Edit produk                      |
| Products     | `/products/:id`         | DELETE | Admin, Manager | Hapus produk                     |
| Categories   | `/categories`           | GET    | All            | List kategori                    |
| Categories   | `/categories`           | POST   | Admin, Manager | Tambah kategori                  |
| Categories   | `/categories/:id`       | PUT    | Admin, Manager | Edit kategori                    |
| Categories   | `/categories/:id`       | DELETE | Admin          | Hapus kategori                   |
| Customers    | `/customers`            | GET    | All            | List customer                    |
| Customers    | `/customers/:id`        | GET    | All            | Detail customer + riwayat        |
| Customers    | `/customers`            | POST   | All            | Tambah customer                  |
| Customers    | `/customers/:id`        | PUT    | Admin, Manager | Edit customer                    |
| Customers    | `/customers/:id`        | DELETE | Admin          | Hapus customer                   |
| Transactions | `/transactions`         | GET    | Admin, Manager | List transaksi                   |
| Transactions | `/transactions`         | POST   | Admin, Cashier | Buat transaksi                   |
| Transactions | `/transactions/:id`     | GET    | All            | Detail transaksi                 |
| Transactions | `/transactions/:id`     | DELETE | Admin          | Hapus transaksi                  |
| Logs         | `/logs`                 | GET    | Admin          | Audit trail aktivitas user       |
| Reports      | `/reports/sales`        | GET    | Admin, Manager | Laporan penjualan harian/bulanan |
| Reports      | `/reports/products/top` | GET    | Admin, Manager | Produk terlaris                  |

---

## 📊 Contoh Laporan & Dashboard

- **/reports/sales**  
  Response: total penjualan per hari/bulan, siap untuk chart dashboard.
- **/reports/products/top**  
  Response: produk terlaris, bisa untuk leaderboard/top chart.

---

## 🛡️ Keamanan & Best Practice

- Semua password di-hash (bcrypt)
- JWT Auth, role-based access
- Validasi input & error handling rapi
- Audit log semua aksi penting
- Struktur folder clean & scalable

---

## 🧑‍💻 Contributing

Pull request, issue, dan feedback sangat welcome!  
Project ini dibuat untuk belajar, portofolio, dan siap dikembangkan lebih lanjut.

---

## ⭐️ Showcase

> Dibuat dengan ❤️ oleh [nazmisani](https://github.com/nazmisani)  
> Powered by Node.js, Express, Prisma, PostgreSQL, TypeScript

---
