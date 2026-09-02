const express = require("express");
const cors = require("cors");

const sellerRoutes = require("./routes/seller/sellerRoutes");
const buyerRoutes = require("./routes/buyer/buyerRoutes");
const adminRoutes = require("./routes/admin/Adminroute");  // this is your admin  route 
// const AdminRoutes = require("./routes/admin/admin.route");
const cookieParser = require("cookie-parser");

const app = express();

// 🔹 Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "https://niryat-aarambh.vercel.app", 
      "https://transparentb2b.com",
      "https://www.transparentb2b.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
    allowedHeaders: ["Content-Type", "Authorization"], // 🔥 YE LINE MISSING THI! Iske bina token drop ho jata hai
    credentials: true,
  }),
);

app.use("/api/sellers", sellerRoutes);
app.use("/api/buyers", buyerRoutes);
app.use("/api/admin", adminRoutes);  // this is your admin route

// 🔹 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found ❌",
  });
});

module.exports = app;
