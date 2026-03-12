# 💸 FinCare

> A full-stack personal finance management app built with **React + Vite** and **Node.js + Express + MongoDB**. Track income and expenses, manage budgets, visualize spending by category, and monitor your financial health — all behind a secure JWT-authenticated API.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
  - [Auth Routes](#auth-routes--apiauth)
  - [Transaction Routes](#transaction-routes--apitransactions-)
  - [Budget Routes](#budget-routes--apibudgets-)
  - [Analytics Routes](#analytics-routes--apianalytics-)
  - [Health Check](#health-check)
- [Frontend Architecture](#-frontend-architecture)
- [Security](#-security)
- [Scripts](#-scripts)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- 🔐 **Auth** — Register, login, logout, token verification, and profile management with JWT + bcryptjs
- 💳 **Transactions** — Full CRUD for income/expense entries with filtering by type, category, and date range
- 📊 **Transaction Summary** — Aggregated totals, balance, and per-category breakdowns
- 🗂️ **Budgets** — Set and track per-category monthly spending limits
- 📈 **Analytics** — Insights on spending patterns and financial trends
- 🧩 **React Context** — `AuthContext` and `FinanceContext` for clean global state
- 🛡️ **Security-first** — Helmet, rate limiting, CORS, input validation, and password hashing baked in
- ⚠️ **Error Boundaries** — Frontend `ErrorBoundary` component prevents full app crashes
- 🏥 **Health Check** — `/api/health` endpoint for monitoring server and DB status

---

## 🛠 Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 4.x |
| Database | MongoDB Atlas via Mongoose 7.x |
| Authentication | JSON Web Tokens (`jsonwebtoken`) |
| Password Hashing | `bcryptjs` |
| Validation | `express-validator` |
| Security | `helmet`, `express-rate-limit`, `cors` |
| Logging | `winston` |
| Dev Server | `nodemon` |

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite (dev port `5173`) |
| State Management | React Context API (`AuthContext`, `FinanceContext`) |
| Navigation | Tab-based via `useState` |
| Styling | CSS (`App.css`) |

---

## 📁 Project Structure

```
fincare/
├── backend/
│   ├── middleware/
│   │   ├── auth.js              # JWT verification — attaches req.user
│   │   └── errorHandler.js      # Global error handling middleware
│   ├── models/
│   │   ├── User.js              # User schema (name, email, password, preferences, isActive)
│   │   └── Transaction.js       # Transaction schema (type, amount, category, date, notes)
│   ├── routes/
│   │   ├── auth.js              # Register, login, logout, verify, profile CRUD
│   │   ├── transactions.js      # Transaction CRUD + summary + filtering
│   │   ├── budgets.js           # Budget CRUD
│   │   └── analytics.js         # Aggregated analytics
│   ├── utils/
│   │   └── generateToken.js     # JWT generation helper
│   ├── .env                     # Environment variables (gitignored)
│   ├── .env.example             # Environment variable template
│   ├── server.js                # Express app entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── TransactionForm.jsx
    │   │   ├── TransactionList.jsx
    │   │   ├── Analytics.jsx
    │   │   ├── BudgetManager.jsx
    │   │   ├── BudgetProgress.jsx
    │   │   ├── CategoryChart.jsx
    │   │   ├── SummaryCard.jsx
    │   │   ├── AuthLayout.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   └── Errorboundary.jsx
    │   ├── contexts/
    │   │   ├── AuthContext.jsx    # isAuthenticated, loading, login/logout state
    │   │   └── FinanceContext.jsx # Transactions, budgets, analytics state
    │   ├── App.jsx                # Root component — tab routing + auth guard
    │   └── App.css
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v9+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account or a local MongoDB instance

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your values — see Environment Variables section below

# 4. Start the development server (hot-reload)
npm run dev
```

The API will be running at `http://localhost:5000`.

---

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the Vite dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

> ⚠️ Make sure the backend is running before starting the frontend — the app calls `http://localhost:5000/api` by default.

---

## 🔑 Environment Variables

Create a `.env` file inside the `/backend` directory. Use `.env.example` as the template:

```env
# Server
PORT=5000

# MongoDB — replace with your actual Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fincare?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# CORS — must match the URL where your frontend runs
FRONTEND_URL=http://localhost:5173
```

> ⚠️ Never commit your `.env` file. It should already be listed in `.gitignore`.

### MongoDB Atlas Quick Setup

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. **Database Access** → create a user with Read/Write permissions
3. **Network Access** → whitelist your IP (or `0.0.0.0/0` for development)
4. **Connect** → copy the connection string → replace `<username>` and `<password>` in `MONGODB_URI`

---

## 📡 API Reference

All protected routes (marked 🔒) require the following header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are returned on successful register and login.

---

### Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login and receive a JWT |
| `POST` | `/api/auth/logout` | 🔒 | Logout (instructs client to discard token) |
| `GET` | `/api/auth/verify` | 🔒 | Verify JWT and return current user |
| `GET` | `/api/auth/profile` | 🔒 | Get the current user's profile |
| `PUT` | `/api/auth/profile` | 🔒 | Update name and/or preferences |

**Register — `POST /api/auth/register`**
```json
// Request body
{
  "name": "Kunal Jaju",        // 2–50 characters
  "email": "kunal@example.com",
  "password": "mypassword"     // min 6 characters
}

// Response 201
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "64f3b...",
      "name": "Kunal Jaju",
      "email": "kunal@example.com",
      "preferences": { "currency": "INR", "language": "en" },
      "lastLogin": "2025-03-12T10:00:00.000Z"
    }
  }
}
```

**Login — `POST /api/auth/login`**
```json
// Request body
{
  "email": "kunal@example.com",
  "password": "mypassword"
}
// Response 200 — same shape as register response
```

**Update Profile — `PUT /api/auth/profile`**
```json
// Request body (all fields optional)
{
  "name": "Kunal J.",
  "preferences": {
    "currency": "USD",   // INR | USD | EUR | GBP
    "language": "en"     // en | hi
  }
}
```

---

### Transaction Routes — `/api/transactions` 🔒

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/transactions` | Get all transactions (supports query filters) |
| `GET` | `/api/transactions/summary` | Get totals, balance, and category breakdown |
| `GET` | `/api/transactions/:id` | Get a single transaction by ID |
| `POST` | `/api/transactions` | Create a new transaction |
| `PUT` | `/api/transactions/:id` | Update an existing transaction |
| `DELETE` | `/api/transactions/:id` | Delete a transaction |

**Query Parameters for `GET /api/transactions`:**

| Param | Type | Description |
|---|---|---|
| `type` | `income` \| `expense` | Filter by transaction type |
| `category` | string | Filter by category name |
| `startDate` | ISO 8601 | Filter transactions from this date |
| `endDate` | ISO 8601 | Filter transactions up to this date |
| `limit` | number | Max number of results to return |

Example:
```
GET /api/transactions?type=expense&category=Food&startDate=2025-01-01&limit=10
```

**Create Transaction — `POST /api/transactions`**
```json
// Request body
{
  "type": "expense",           // "income" or "expense"
  "amount": 1200.50,           // positive number, min 0.01
  "description": "Groceries",  // 1–200 characters
  "category": "Food",          // 1–50 characters
  "date": "2025-03-10",        // ISO 8601
  "notes": "Weekly shop"       // optional
}

// Response 201
{
  "success": true,
  "message": "Transaction created successfully",
  "data": { /* full transaction object */ }
}
```

**Transaction Summary — `GET /api/transactions/summary`**
```json
// Response 200
{
  "success": true,
  "data": {
    "totalIncome": 50000,
    "totalExpenses": 22000,
    "balance": 28000,
    "transactionCount": 34,
    "categoryBreakdown": {
      "Food": 8000,
      "Transport": 3000,
      "Entertainment": 5000
    }
  }
}
```

---

### Budget Routes — `/api/budgets` 🔒

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/budgets` | Get all budgets for the logged-in user |
| `POST` | `/api/budgets` | Create a new budget |
| `PUT` | `/api/budgets/:id` | Update a budget |
| `DELETE` | `/api/budgets/:id` | Delete a budget |

**Create Budget — `POST /api/budgets`**
```json
{
  "category": "Food",
  "limit": 5000,
  "month": "2025-03"
}
```

---

### Analytics Routes — `/api/analytics` 🔒

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics` | Get aggregated financial analytics for the user |

---

### Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | ❌ | Server and DB connection status |

```json
// Response 200
{
  "status": "OK",
  "message": "FinCare API is running",
  "timestamp": "2025-03-12T10:00:00.000Z",
  "dbStatus": "connected"
}
```

---

## 🖥 Frontend Architecture

The frontend is a single-page React app using **tab-based navigation** (no router library) and **Context API** for global state.

### App Component Tree

```
App.jsx
└── ErrorBoundary             ← Catches unhandled render errors app-wide
    └── AuthProvider          ← Provides isAuthenticated, loading, user state
        └── AppContent
            ├── LoadingSpinner     ← While auth state is resolving
            ├── AuthLayout         ← Login / Register (unauthenticated users)
            └── FinanceProvider    ← Transactions, budgets, analytics state
                └── app layout
                    ├── Header
                    ├── Sidebar    ← Controls activeTab state
                    └── main
                        └── ProtectedRoute
                            ├── Dashboard          (tab: "dashboard")
                            ├── SummaryCard +
                            │   CategoryChart +
                            │   BudgetProgress     (tab: "summary")
                            ├── TransactionForm    (tab: "add-transaction")
                            ├── TransactionList    (tab: "transactions")
                            ├── Analytics          (tab: "analytics")
                            └── BudgetManager      (tab: "budget")
```

### Contexts

| Context | State / Actions Provided |
|---|---|
| `AuthContext` | `isAuthenticated`, `loading`, `user`, `login()`, `logout()` |
| `FinanceContext` | Transactions, budgets, analytics data and their CRUD actions |

---

## 🛡️ Security

| Layer | Tool | Details |
|---|---|---|
| HTTP Security Headers | `helmet` | XSS protection, HSTS, content-type sniffing prevention |
| Rate Limiting | `express-rate-limit` | 100 requests / IP / 15 minutes across all `/api/` routes |
| CORS | `cors` | Restricted to `FRONTEND_URL` only — no wildcard origins |
| Authentication | `jsonwebtoken` | Stateless JWT verification on every protected route |
| Password Security | `bcryptjs` | Passwords are salted and hashed before storage |
| Input Validation | `express-validator` | All write endpoints validate and sanitize request bodies |
| Body Size Cap | `express.json` | Incoming request bodies capped at 10mb |
| Account Status Check | Custom middleware | Login rejected if `user.isActive === false` |

---

## 📜 Scripts

### Backend

```bash
npm start       # Start server with node (production)
npm run dev     # Start server with nodemon (development, hot-reload)
```

### Frontend

```bash
npm run dev     # Start Vite dev server at http://localhost:5173
npm run build   # Build for production (outputs to /dist)
npm run preview # Preview the production build locally
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit with conventional commits: `git commit -m 'feat: add my feature'`
4. Push your branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please make sure your code is clean and linted before submitting a PR.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">Built with ❤️ by the FinCare Development Team</p>
