# 💸 Smart Expense Tracker with AI Insights

A full-stack MERN application for tracking personal expenses with AI-powered spending insights.

---

## 📁 Project Structure

```
smart-expense-tracker/
├── backend/                   ← Node.js + Express API
│   ├── config/db.js           ← MongoDB connection
│   ├── controllers/           ← Business logic
│   │   ├── authController.js
│   │   ├── expenseController.js
│   │   └── insightController.js
│   ├── middleware/
│   │   └── authMiddleware.js  ← JWT verification
│   ├── models/
│   │   ├── User.js            ← User schema
│   │   └── Expense.js         ← Expense schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── expenseRoutes.js
│   │   └── insightRoutes.js
│   ├── .env                   ← Environment variables
│   └── server.js              ← Entry point
│
└── frontend/                  ← React + Vite app
    ├── src/
    │   ├── api/axios.js        ← Axios instance + API helpers
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── ExpenseCard.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx ← Global auth state
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── AddExpense.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    └── .env
```

---

## ⚙️ Prerequisites

Before you start, make sure you have installed:

| Tool | Version | Check |
|------|---------|-------|
| Node.js | v18+ | `node --version` |
| npm | v8+ | `npm --version` |
| MongoDB | v6+ (local) OR MongoDB Atlas | - |
| Git | any | `git --version` |

---

## 🚀 Step-by-Step Setup

### Step 1: Clone / Create the project folder

```bash
mkdir smart-expense-tracker
cd smart-expense-tracker
```

### Step 2: Set up the Backend

```bash
# Navigate into backend folder
cd backend

# Install dependencies
npm install

# This installs:
# - express       → Web server framework
# - mongoose      → MongoDB ODM
# - bcryptjs      → Password hashing
# - jsonwebtoken  → JWT auth
# - cors          → Cross-Origin Resource Sharing
# - dotenv        → Environment variables
# - nodemon       → Auto-restart in dev (devDependency)
```

### Step 3: Configure Backend Environment Variables

Edit the `backend/.env` file:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

> **MongoDB Atlas (Cloud):** Replace MONGO_URI with your Atlas connection string:
> `MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/expense-tracker`

### Step 4: Start the Backend

```bash
# From the backend/ directory:

# Development mode (auto-restarts on file changes)
npm run dev

# OR Production mode
npm start
```

You should see:
```
Server running on http://localhost:5000
MongoDB Connected: localhost
```

### Step 5: Set up the Frontend

```bash
# Open a new terminal, navigate to frontend/
cd frontend

# Install dependencies
npm install

# This installs:
# - react, react-dom     → UI library
# - react-router-dom     → Client-side routing
# - axios                → HTTP client
# - recharts             → Charts library
# - vite                 → Build tool
```

### Step 6: Configure Frontend Environment Variables

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 7: Start the Frontend

```bash
# From the frontend/ directory:
npm run dev
```

You should see:
```
VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

### Step 8: Open the App

Visit **http://localhost:3000** in your browser.

1. Click "Create Account" to register
2. Login with your credentials
3. Add your first expense
4. View the dashboard and AI insights!

---

## 🔌 API Reference

### Auth Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

**Register / Login Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "_id": "abc123",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

---

### Expense Endpoints (all require `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all expenses (supports ?month=&year=&category= filters) |
| POST | `/api/expenses` | Add new expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |

**Add Expense Request Body:**
```json
{
  "amount": 250.50,
  "category": "Food",
  "date": "2024-01-15",
  "note": "Lunch at work"
}
```

---

### Insights Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/insights` | Get AI insights & analysis |

**Response:**
```json
{
  "summary": {
    "currentMonth": { "total": 5200, "count": 18, "dailyAverage": 173.3 },
    "previousMonth": { "total": 4100, "count": 14 },
    "monthChangePercent": 26.8
  },
  "categoryBreakdown": {
    "Food": 2100,
    "Travel": 800,
    "Bills": 1500,
    "Entertainment": 500,
    "Others": 300
  },
  "suggestions": [
    {
      "type": "warning",
      "icon": "⚠️",
      "title": "High Food spending",
      "message": "You are spending too much on Food. It accounts for 40% of your total expenses this month (₹2100)."
    }
  ]
}
```

---

## 🤖 How AI Insights Work

The insights engine (`insightController.js`) uses pure JavaScript logic — no external AI API needed:

1. **Category Analysis** — Calculates total per category, flags if any category exceeds 40% of total spending
2. **Month-over-Month Comparison** — Compares current month vs previous month; warns if increase > 20%, celebrates if decrease > 10%
3. **Daily Average & Projection** — Calculates daily burn rate and projects end-of-month total
4. **Zero Spending Detection** — Positively reinforces categories with no spending
5. **Trend Detection** — Identifies if spending is increasing, decreasing, or stable

---

## 🛡️ Security Features

- Passwords are hashed using **bcryptjs** (salt rounds: 10) before storing
- JWT tokens expire in **7 days**
- Every expense route checks that the expense belongs to the requesting user
- Axios interceptor automatically attaches the token to all requests
- 401 responses automatically log out the user

---

## 📦 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Charts | Recharts |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Dev Server | Nodemon |

---

## 🐛 Common Issues & Fixes

**MongoDB connection refused:**
- Make sure MongoDB service is running: `sudo systemctl start mongod` (Linux) or start MongoDB app (Mac/Windows)

**CORS error in browser:**
- Ensure backend has `app.use(cors())` before routes (already done)

**Token expired / 401 errors:**
- The app auto-logs out on 401. Just log in again.

**Port already in use:**
- Change `PORT` in backend `.env` and `VITE_API_URL` in frontend `.env`

---

## 🎓 Good Luck with Your Interview / Submission!
