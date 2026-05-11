const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getAllSellers,
  updateSellerStatus,
  createProduct,
  getAllProducts,
} = require("../../controller/adminController")
const auth = require("../../middlewares/authMiddleware");

// Define Routes
router.post("/register", registerAdmin); // Postman se hit karke ek account bana lena
router.post("/login", loginAdmin); // Frontend AdminLogin.jsx se hit hoga
router.post("/logout", logoutAdmin); // Sidebar ke logout button se hit hoga

router.get('/sellers', auth.protectAdmin, getAllSellers); 

router.put('/sellers/:id/status', auth.protectAdmin, updateSellerStatus);
router.post('/product', auth.protectAdmin, createProduct);
router.get('/products', auth.protectAdmin, getAllProducts); // Naya route products ke liye

module.exports = router;
