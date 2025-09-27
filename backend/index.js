const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs"); // <--- 1. Import the 'fs' module
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const transactionRoutes = require("./routes/transaction.routes");
const categoryRoutes = require("./routes/category.routes");
const budgetRoutes = require("./routes/budget.routes");
const reportRoutes = require("./routes/report.routes");
const userRoutes = require("./routes/user.route");
dotenv.config();

const uploadsDir = path.join(__dirname, 'uploads');

// --- 3. Check if the directory exists and create it if not ---
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log(`✅ Created directory: ${uploadsDir}`);
}

const app = express();

// Middleware
app.use(express.json());

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "https://expense-tracker-delta-green.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use('/uploads', express.static(uploadsDir));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);

// Connect DB
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));