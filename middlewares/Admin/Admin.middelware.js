const jwt = require("jsonwebtoken");
const Admin = require("../../models/Admin.model");

const adminAuthMiddleware = async (req, res, next) => {
  try {
    // 🔥 1. Cookie ki jagah Header se token nikalna hai (Jaisa seller me kiya hai)
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; 

    // Agar token nahi mila header mein, toh cookie fallback bhi check kar sakte ho 
    // (Kyunki tere register function me abhi bhi res.cookie("token", token) hai)
    const finalToken = token || (req.cookies && req.cookies.token);

    if (!finalToken || finalToken === "undefined" || finalToken === "null") {
      return res.status(401).json({ message: "No token provided, authorization denied." });
    }

    // 2. Token verify karo
    const decoded = jwt.verify(finalToken, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id); 
    
    // 3. Admin check karo
    if (!admin) {
        return res.status(404).json({ message: "Admin not found." });
    }

    // 4. Req object mein admin ko attach karo
    req.admin = admin;

    // 5. Sab sahi hai toh next() call karo (🔥 Note: next() ko try block ke andar rakhna zaroori hai)
    next(); 
  } catch (error) {
    console.error("Admin Auth Error:", error);
    // 401 bhejo agar token expire ho gaya ya galat hai
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = {
    adminAuthMiddleware
};