const express = require("express");
const cors = require("cors");
const BuyerRoutes = require("./routes/buyer/buyer");
const SellerRoutes = require("./routes/seller/seller.route");
const AdminRoutes = require("./routes/admin/admin.route");
const cookieParser = require("cookie-parser");

const app = express();

// 🔹 Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://niryat-aarambh.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use("/api/buyers", BuyerRoutes);
app.use("/api/sellers", SellerRoutes);
app.use("/api/admin", AdminRoutes);

// 🔹 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found ❌",
  });
});

module.exports = app;