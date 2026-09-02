const express = require("express");
const router = express.Router();
const adminController = require("../../controller/Admin/Admin.controller");
const adminAuthMiddleware = require("../../middlewares/Admin/Admin.middelware");

// Apply the adminAuthMiddleware to all routes below  

router.post("/register", adminController.adminregister);
router.post("/login", adminController.adminlogin);
router.get("/sellers", adminAuthMiddleware.adminAuthMiddleware, adminController.getAllSeller); //get seller data from db via admin
router.get("/sellers/:sellerId/products", adminAuthMiddleware.adminAuthMiddleware, adminController.getItemOfSeller); //get seller data from db via admin
router.post("/logout", adminAuthMiddleware.adminAuthMiddleware, adminController.adminlogout);
router.get("/inquiries", adminAuthMiddleware.adminAuthMiddleware, adminController.getAllInquiries); //get all inquiries for admin

module.exports = router;