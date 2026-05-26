const jwt = require("jsonwebtoken");
const Seller = require("../models/sellerModel.js"); 

const verifySellerToken = async (req, res, next) => {
  try {
    // 🔥 1. Ab Cookie ki jagah Header se token nikalna hai
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // 'Bearer TOKEN' se 'TOKEN' nikala

    if (!token || token === "undefined" || token === "null") {
      return res.status(401).json({ error: "Access Denied. Please login to continue." });
    }

    // 2. Token ko verify aur decode karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check karo ki kya database me seller abhi bhi exist karta hai
    const sellerExists = await Seller.findById(decoded.id);
    if (!sellerExists) {
      return res.status(401).json({ error: "Seller account no longer exists." });
    }

    // 4. Req object mein user ki ID attach kar do
    req.user = decoded; 

    // 5. Sab sahi hai toh request aage bhejo
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(403).json({ error: "Session expired or invalid token. Please login again." });
  }
};

module.exports = verifySellerToken;