# Fincare Contributing Guide

Thank you for your interest in contributing to Fincare! Follow this guide to set up the project locally, run development scripts, and understand how to submit your contributions.

---

## 🛠️ Getting Started & Setup

### Prerequisites
Before you begin, ensure you have the following installed on your local machine:
- **Node.js** v18 or higher
- **npm** v9 or higher
- A **MongoDB Atlas** account or a local MongoDB instance

---

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy the example environment file (if available) or create a new `.env` file:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and configure it with your settings. See the [Environment Variables](#-environment-variables) section below.

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The API server will run locally at `http://localhost:5000`.

---

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend/fincare
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   The web app will run locally at `http://localhost:5173`.

> [!WARNING]
> Ensure the backend server is running before opening the frontend. By default, the frontend is configured to call the backend API at `http://localhost:5000/api`.

---

## 🔑 Environment Variables

Create a `.env` file inside the `backend` directory. Use the template below:

```env
# Server Configuration
PORT=5000

# MongoDB Connection String (Replace with your Atlas connection string)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fincare?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration (Must match the URL where your frontend runs)
FRONTEND_URL=http://localhost:5173
```

> [!IMPORTANT]
> Never commit your `.env` file to version control. The `.gitignore` file is pre-configured to ignore it.

### MongoDB Atlas Quick Setup
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Go to **Database Access** and create a database user with Read/Write privileges.
3. Go to **Network Access** and whitelist your current IP address (or `0.0.0.0/0` for testing).
4. Go to **Database**, click **Connect**, select **Drivers**, and copy the connection string. Replace `<username>` and `<password>` with your database user credentials in `MONGODB_URI`.

---

## 📜 Available Scripts

### Backend Scripts (from the `/backend` directory)

| Script | Command | Description |
|---|---|---|
| **Development** | `npm run dev` | Runs the Express API server with `nodemon` for hot-reloading. |
| **Production** | `npm start` | Starts the Express API server using Node. |

### Frontend Scripts (from the `/frontend/fincare` directory)

| Script | Command | Description |
|---|---|---|
| **Development** | `npm run dev` | Starts the Vite dev server at `http://localhost:5173`. |
| **Build** | `npm run build` | Compiles the React production bundle and outputs to `/dist`. |
| **Preview** | `npm run preview` | Runs the compiled production build locally for testing. |

---

## 🤝 Contribution Workflow

We welcome pull requests to improve Fincare. Please follow the steps below:

1. **Fork the Repository** and clone your fork to your local machine.
2. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/my-feature
   ```
3. **Write Clean Code:** Ensure your edits are clean, well-formatted, and linted.
4. **Commit Your Changes:** We prefer clean and descriptive commit messages (e.g. following Conventional Commits format):
   ```bash
   git commit -m "feat: add analytics transaction filtering"
   ```
5. **Push to GitHub:**
   ```bash
   git push origin feature/my-feature
   ```
6. **Open a Pull Request:** Describe your changes in detail and submit the PR.
