# FinCare Deployment Guide

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
VITE_APP_NAME=FinCare
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

## Production Deployment

### Backend Deployment (Heroku/Railway/Vercel)
1. Set environment variables in your hosting platform
2. Ensure MongoDB URI is correctly configured
3. Deploy the backend

### Frontend Deployment (Vercel/Netlify)
1. Set environment variables in your hosting platform
2. Update VITE_API_URL to point to your deployed backend
3. Deploy the frontend

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
