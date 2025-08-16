# ✅ API Checklist

Dokumentasi ini berisi daftar endpoint API beserta fungsinya.  
Gunakan checklist `[ ]` → `[x]` untuk menandai endpoint yang sudah selesai diimplementasikan.

---

## 📌 1. Auth (Authentication)

> Endpoint untuk autentikasi user (login & ambil profil).

- [✅] **POST** `/auth/login`  
   Login user dengan email & password → return JWT token.  
   🔑 _Akses_: Semua user terdaftar

- [✅] **GET** `/auth/profile`  
   Ambil data user yang sedang login (berdasarkan JWT token).  
   🔑 _Akses_: Semua user login

---

## 📌 2. User Management (Hanya Admin)

> CRUD untuk user (khusus role **Admin**).

- [] **GET** `/users`  
   Lihat daftar semua user.  
   🔑 _Akses_: Admin

- [✅] **POST** `/users`  
   Tambah user baru (role: admin, manager, cashier).  
   🔑 _Akses_: Admin

- [ ] **PUT** `/users/:id`  
       Edit data user (nama, email, role).  
       🔑 _Akses_: Admin

- [ ] **DELETE** `/users/:id`  
       Hapus user dari sistem.  
       🔑 _Akses_: Admin

---

## 📌 3. Product Management

> CRUD untuk produk (bisa diakses oleh Admin & Manager, dengan keterbatasan untuk Cashier).

- [ ] **GET** `/products`  
       Lihat daftar produk.  
       🔑 _Akses_: Admin, Manager, Cashier

- [ ] **POST** `/products`  
       Tambah produk baru.  
       🔑 _Akses_: Admin, Manager

- [ ] **PUT** `/products/:id`  
       Edit data produk.  
       🔑 _Akses_: Admin, Manager

- [ ] **DELETE** `/products/:id`  
       Hapus produk.  
       🔑 _Akses_: Admin, Manager

---

## 📌 4. Transaction Management

> Manajemen transaksi penjualan.

- [ ] **GET** `/transactions`  
       Lihat semua transaksi yang tercatat.  
       🔑 _Akses_: Admin, Manager

- [ ] **POST** `/transactions`  
       Buat transaksi baru (misalnya saat kasir input penjualan).  
       🔑 _Akses_: Cashier, Admin

- [ ] **GET** `/transactions/:id`  
       Lihat detail transaksi tertentu.  
       🔑 _Akses_: Admin, Manager, Cashier

- [ ] **DELETE** `/transactions/:id`  
       Hapus transaksi dari sistem.  
       🔑 _Akses_: Admin

---

## 📌 5. Log Management

> Menyimpan & melihat aktivitas user dalam sistem.

- [ ] **GET** `/logs`  
       Lihat log aktivitas user (audit trail).  
       🔑 _Akses_: Admin
