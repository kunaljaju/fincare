# Fincare Deployment Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

## Environment Setup

### Backend Environment Variables
Create a `.env` file in the `backend` directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://kunal1902:123456@fincare.nsuxwpd.mongodb.net/?retryWrites=true&w=majority&appName=fincare

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173/

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables
Create a `.env` file in the `frontend/fincare` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=Fincare
VITE_APP_VERSION=1.0.0
```


## Local Development

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend/fincare
npm install
npm run dev
```

## 🚀 Production Deployment Step-by-Step

This section guides you through deploying the **Express Backend API to Render** and the **React Frontend App to Vercel**.

---

### 📡 Part 1: Deploy the Backend to Render

[Render](https://render.com/) is a cloud hosting platform that can automatically build and run your Node.js Express server.

1. **Create a Render Account:**
   * Go to [Render](https://render.com/) and sign in (connecting your GitHub account makes imports seamless).
2. **Create a New Web Service:**
   * Click **New +** in the Render dashboard and select **Web Service**.
   * Select your Fincare repository from the list of connected repositories.
3. **Configure Service Settings:**
   * **Name:** `fincare-backend` (or a name of your choice).
   * **Environment:** `Node` (Render auto-detects this).
   * **Region:** Select a region closest to your target audience or your MongoDB cluster.
   * **Branch:** `master` (or your active branch name).
   * **Root Directory:** `backend` (⚠️ **CRITICAL:** You must set this to `backend` because your backend code is inside a subdirectory).
   * **Build Command:** `npm install`
   * **Start Command:** `node server.js`
4. **Configure Environment Variables:**
   * Click the **Advanced** button or go to the **Environment** tab.
   * Add the following environment variables:
     * `MONGODB_URI`: Set to your production MongoDB Atlas connection string.
     * `JWT_SECRET`: Generate a secure, random secret key.
     * `JWT_EXPIRE`: `7d`
     * `NODE_ENV`: `production`
     * `FRONTEND_URL`: Set to your deployed Vercel frontend URL (e.g., `https://fincare.vercel.app`). *Note: If you do not know this URL yet, you can input your domain placeholder or `*` temporarily, then update it after the frontend deployment is complete.*
5. **Deploy the Web Service:**
   * Click **Create Web Service**. Render will trigger the build pipeline.
   * Once deployment completes successfully, copy the active URL provided at the top of the Render logs page (e.g., `https://fincare-backend.onrender.com`).

---

### 🖥️ Part 2: Deploy the Frontend to Vercel

[Vercel](https://vercel.com/) is a static hosting platform optimized for frontend React and Vite projects.

1. **Create a Vercel Account:**
   * Sign in to [Vercel](https://vercel.com/) (GitHub login recommended).
2. **Import the Repository:**
   * In the Vercel dashboard, click **Add New...** and select **Project**.
   * Locate and click **Import** next to your Fincare repository.
3. **Configure Project Settings:**
   * **Project Name:** `fincare-frontend` (or similar).
   * **Framework Preset:** `Vite` (Vercel automatically detects this configuration).
   * **Root Directory:** Click **Edit** and select `frontend/fincare` (⚠️ **CRITICAL:** You must target the `/frontend/fincare` subdirectory, as this is where the React/Vite source code is located).
4. **Configure Environment Variables:**
   * Expand the **Environment Variables** section.
   * Add the following key-value pair:
     * **Key:** `VITE_API_URL`
     * **Value:** `https://your-backend-url.onrender.com/api` (Replace this with the actual URL of your deployed Render backend API from Part 1).
5. **Deploy:**
   * Click **Deploy**. Vercel will install dependencies, compile the React build files (`npm run build`), and host the static folder.
   * Once complete, Vercel will provide your final deployed public URL (e.g., `https://fincare.vercel.app`).
6. **Final Step (Update CORS origin in Render):**
   * Return to your Render Dashboard for your backend service.
   * Go to the **Environment** tab and update `FRONTEND_URL` to match the new live Vercel URL. Render will automatically redeploy the backend with the updated CORS rules.

## Features Included

✅ **Authentication System**
- User registration and login
- JWT token-based authentication
- Protected routes

✅ **Transaction Management**
- Add, edit, delete transactions
- Income and expense tracking
- Category-based organization

✅ **Budget Management**
- Create and manage budgets
- Budget progress tracking
- Category-wise budget allocation

✅ **Analytics Dashboard**
- Expense categorization with pie charts
- Monthly trend analysis
- Summary statistics

✅ **Responsive Design**
- Mobile-friendly interface
- Modern UI components
- Indian Rupee (₹) currency support

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification
- `GET /api/auth/profile` - Get user profile

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Analytics
- `GET /api/analytics` - Get analytics data

## Security Features
- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- CORS protection
- Input validation
- Helmet security headers

## Troubleshooting

### Common Issues
1. **MongoDB Connection Error**: Check your MongoDB URI and network access
2. **CORS Errors**: Ensure FRONTEND_URL is correctly set
3. **JWT Errors**: Verify JWT_SECRET is set and consistent
4. **Build Errors**: Check Node.js version compatibility

### Testing the API
Use the test endpoints to verify functionality:
- `GET /api/health` - Health check
- `GET /api/auth/test` - Auth routes test
- `GET /api/transactions/test` - Transactions test
- `GET /api/budgets/test` - Budgets test
- `GET /api/analytics/test` - Analytics test

## Support
For issues or questions, check the console logs and ensure all environment variables are properly configured.
