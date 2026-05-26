const jwt = require("jsonwebtoken");
const Seller = require("../models/sellerModel.js"); // Apne model ka path check kar lena

const verifySellerToken = async (req, res, next) => {
  try {
    // 1. Browser se aayi hui cookie se token nikalo
    const token = req.cookies?.token;

    // 2. Agar token nahi hai, matlab user logged in nahi hai
    if (!token) {
      return res.status(401).json({ error: "Access Denied. Please login to continue." });
    }

    // 3. Token ko verify aur decode karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. (Optional but Pro-level) Check karo ki kya database me seller abhi bhi exist karta hai
    const sellerExists = await Seller.findById(decoded.id);
    if (!sellerExists) {
      // Agar account delete ho chuka hai toh cookie bhi clear kar do
      res.clearCookie("token");
      return res.status(401).json({ error: "Seller account no longer exists." });
    }

    // 5. Req object mein user ki ID attach kar do taaki controllers isko use kar sakein
    req.user = decoded; // Isme { id: "seller_ka_id_yahan_hoga" } aayega

    // 6. Sab sahi hai toh request ko aage (controller tak) jaane do
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    // Agar token expire ho gaya ya manipulate hua hai
    res.clearCookie("token"); // Invalid token ko hata do
    return res.status(403).json({ error: "Session expired or invalid token. Please login again." });
  }
};

module.exports = verifySellerToken;