const express = require("express");
const router = express.Router();
// const upload = require("../middlewares/upload");
const sellerController = require("../../controller/sellerController/sellerController");
const upload = require("../../middlewares/multer"); // Multer middleware import karna
const verifySellerToken = require("../../middlewares/authMiddlware");

// OTP Routes
router.post("/send-otp", sellerController.sendOtp);
router.post("/verify-otp", sellerController.verifyOtp);

// Registration Route (Handles multiple fields for files)
router.post(
  "/register", 
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  sellerController.completeRegistration
);
// router.post("/login-send-otp", sellerController.loginSendOTP);
router.post("/login", sellerController.login);
router.post("/logout", sellerController.logout);

// Subscription Route
router.put("/update-plan", sellerController.updatePlan);
router.post("/add-product",  upload.any(), sellerController.addProduct);
router.get("/my-products", verifySellerToken, sellerController.getMyProducts);
router.put("/update-product/:id", upload.any(), sellerController.updateProduct);
router.get("/my-inquiries", verifySellerToken, sellerController.getSellerInquiries);
router.put("/update-status/:id", verifySellerToken, sellerController.updateInquiryStatus);



module.exports = router;