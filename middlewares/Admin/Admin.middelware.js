const jwt = require("jsonwebtoken");
const Admin = require("../../models/Admin.model");

const adminAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token; // Assuming the token is stored in cookies
    if(!token) {
      return res.status(401).json({ message: "No token provided, authorization denied." });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id); 
    req.admin = admin;
    if (!admin) {
        return res.status(404).json({ message: "Admin not found." });
    }
    req.admin = admin;
} catch (error) {
  res.status(400).json({ message: "Invalid token." });
}
    next();
}

module.exports = {
    adminAuthMiddleware
};