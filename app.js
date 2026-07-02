const express = require("express");
const cors = require("cors");

const sellerRoutes = require("./routes/seller/sellerRoutes");
const buyerRoutes = require("./routes/buyer/buyerRoutes");
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
      "http://localhost:5173", // Tera local Vite/React server
      "https://niryat-aarambh.vercel.app", // Tera Vercel production URL
      "https://www.transparentb2b.com",
       "https://www.transparentb2b.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // OPTIONS add kiya hai
    credentials: true, // 🔥 Ye bilkul sahi hai cookies ke liye
  }),
);

app.use("/api/sellers", sellerRoutes);
app.use("/api/buyers", buyerRoutes);

// 🔹 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found ❌",
  });
});

module.exports = app;
