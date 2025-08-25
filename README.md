# <img src="https://raw.githubusercontent.com/nazmisani/minipos-api/main/server/public/pos-rocket.gif" width="40" style="vertical-align:middle;"> MiniPOS API

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18.x-brightgreen?logo=node.js" />
  <img src="https://img.shields.io/badge/Express.js-5.x-black?logo=express" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/PostgreSQL-15.x-blue?logo=postgresql" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2e3440?logo=prisma" />
  <img src="https://img.shields.io/badge/JWT-Auth-orange?logo=jsonwebtokens" />
  <img src="https://img.shields.io/badge/REST%20API-Ready-success?logo=api" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=22&pause=1000&color=36BCF7&center=true&vCenter=true&width=600&lines=The+Ultimate+Open+Source+POS+API;Modern+Clean+Code+%7C+Enterprise+Ready;Built+with+TypeScript%2C+Prisma%2C+Postgres;Plug+%26+Play+for+Your+Next+Project!"/>
</p>

---

## ✨ Features

- **Role-based Auth**: Superadmin, Admin, Manager, Cashier
- **Product & Category CRUD**: Stock, validation, relation
- **Customer & Transaction**: History, detail, stock auto-update
- **Audit Log**: All important actions are tracked
- **Sales & Top Product Reports**: For dashboard & analytics
- **Modern Error Handling**: Consistent, developer-friendly

---

## 🚦 Quick Start

```bash
# 1. Clone & Install
git clone https://github.com/nazmisani/minipos-api.git
cd minipos-api/server
npm install

# 2. Setup Database
cp .env.example .env
# Edit .env and fill your DATABASE_URL
npx prisma migrate dev --name init
npx prisma db seed

# 3. Run Development
npm run dev
# or
bun run dev
```

---

## 🔐 Authentication & Roles

- JWT-based, secure, scalable
- Roles: `superadmin`, `admin`, `manager`, `cashier`
- All endpoints require `Authorization: Bearer <token>`

---

## 📚 API Endpoints (Summary)

<details>
<summary>Click to expand full endpoint table</summary>

| Resource     | Endpoint                | Method | Role           | Description                  |
| ------------ | ----------------------- | ------ | -------------- | ---------------------------- |
| Auth         | `/auth/login`           | POST   | All            | Login user                   |
| Auth         | `/auth/profile`         | GET    | All (login)    | Get user profile             |
| Users        | `/users`                | GET    | Admin          | List users                   |
| Users        | `/users`                | POST   | Superadmin     | Add user                     |
| Users        | `/users/:id`            | PUT    | Admin          | Edit user                    |
| Users        | `/users/:id`            | DELETE | Admin          | Delete user                  |
| Products     | `/products`             | GET    | All            | List products                |
| Products     | `/products`             | POST   | Admin, Manager | Add product                  |
| Products     | `/products/:id`         | PUT    | Admin, Manager | Edit product                 |
| Products     | `/products/:id`         | DELETE | Admin, Manager | Delete product               |
| Categories   | `/categories`           | GET    | All            | List categories              |
| Categories   | `/categories`           | POST   | Admin, Manager | Add category                 |
| Categories   | `/categories/:id`       | PUT    | Admin, Manager | Edit category                |
| Categories   | `/categories/:id`       | DELETE | Admin          | Delete category              |
| Customers    | `/customers`            | GET    | All            | List customers               |
| Customers    | `/customers/:id`        | GET    | All            | Customer detail + history    |
| Customers    | `/customers`            | POST   | All            | Add customer                 |
| Customers    | `/customers/:id`        | PUT    | Admin, Manager | Edit customer                |
| Customers    | `/customers/:id`        | DELETE | Admin          | Delete customer              |
| Transactions | `/transactions`         | GET    | Admin, Manager | List transactions            |
| Transactions | `/transactions`         | POST   | Admin, Cashier | Create transaction           |
| Transactions | `/transactions/:id`     | GET    | All            | Transaction detail           |
| Transactions | `/transactions/:id`     | DELETE | Admin          | Delete transaction           |
| Logs         | `/logs`                 | GET    | Admin          | User activity audit trail    |
| Reports      | `/reports/sales`        | GET    | Admin, Manager | Sales report (daily/monthly) |
| Reports      | `/reports/products/top` | GET    | Admin, Manager | Top selling products         |

</details>

---

## 📊 Dashboard-Ready Reports

- **/reports/sales**: Daily/monthly sales, ready for charting
- **/reports/products/top**: Top products leaderboard

---

## 🛡️ Security & Best Practices

- Passwords hashed (bcrypt)
- JWT Auth, role-based access
- Input validation & error handling
- Audit log for all critical actions
- Clean, scalable folder structure

---

## 🧑‍💻 Contributing

Pull requests, issues, and feedback are welcome!  
This project is for learning, portfolio, and ready for further development.

---

## ⭐️ Showcase

> Made by [nazmisani](https://github.com/nazmisani)  
> Powered by Node.js, Express, Prisma, PostgreSQL, TypeScript
