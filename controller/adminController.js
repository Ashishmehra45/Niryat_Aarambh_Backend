const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
const Seller = require("../models/seller");
const Product = require("../models/Product");

// 🔥 1. Register Admin (Use this once via Postman to create your account, then disable it)
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res
        .status(400)
        .json({ message: "This email is already registered." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Admin
    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
      role: role || "superadmin",
    });

    await admin.save();
    res.status(201).json({ message: "System Operator created successfully!" });
  } catch (error) {
    console.error("Admin Reg Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🔐 2. Admin Login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(401)
        .json({ message: "Invalid credentials. Unauthorized access." });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid credentials. Unauthorized access." });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }, // Admin session thoda chota rakhna safe hota hai
    );

    // Set Secure HTTP-Only Cookie
    res.cookie("adminToken", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 12 * 60 * 60 * 1000,
});

    res.status(200).json({
      message: "Login successful.",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ message: "System error", error: error.message });
  }
};

const getAllSellers = async (req, res) => {
  try {
    // Optional: Agar URL me status pass kiya (e.g., ?status=pending) toh filter karega, warna saare layega
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Database se find karo, password field ko exclude karo (-password), aur latest pehle dikhao (createdAt: -1)
    const sellers = await Seller.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sellers.length,
      data: sellers,
    });
  } catch (error) {
    console.error("Fetch Sellers Error:", error);
    res.status(500).json({ message: "System Error! Cannot fetch sellers." });
  }
};

const updateSellerStatus = async (req, res) => {
  try {
    const { id } = req.params; // URL se seller ka ID milega
    const { status } = req.body; // Body se naya status ('approved' ya 'rejected')

    // Sirf valid status allow karenge
    if (!["approved", "rejected", "pending", "suspended"].includes(status)) {
      return res.status(400).json({ message: "Invalid status code!" });
    }

    // Database me dhundo aur update maro
    const updatedSeller = await Seller.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }, // naya updated document return karega
    ).select("-password");

    if (!updatedSeller) {
      return res.status(404).json({ message: "Seller not found in database!" });
    }

    res.status(200).json({
      success: true,
      message: `Seller has been marked as ${status.toUpperCase()}`,
      data: updatedSeller,
    });
  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({ message: "System Error! Cannot update status." });
  }
};
const createProduct = async (req, res) => {
  try {
    // 1. Frontend ya Postman se data nikalna
    const { name, description, category, price, stock, sellerId } = req.body;

    // 2. Basic Validation
    if (!name || !description || !category || !price || !stock || !sellerId) {
      return res
        .status(400)
        .json({ message: "All fields including Seller ID are required." });
    }

    // 3. Check karna ki Seller sach me database me hai ya nahi
    const sellerExists = await Seller.findById(sellerId);
    if (!sellerExists) {
      return res
        .status(404)
        .json({ message: "Seller not found in the database." });
    }

    // 4. Product Create Karna
    const newProduct = new Product({
      name,
      description,
      category,
      price,
      stock,
      seller: sellerId, // Seller ki ID jo frontend se aayi
      createdByAdmin: req.admin._id, // 🛡️ Ye ID humare protectAdmin middleware se aayegi
    });

    // 5. Database me save karna
    const savedProduct = await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product cataloged successfully for the seller!",
      data: savedProduct,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res
      .status(500)
      .json({
        message: "System error! Cannot create product.",
        error: error.message,
      });
  }
};

const getAllProducts = async (req, res) => {
  try {
    // 1. Database se saare products find karo
    // 2. .populate() use karo taaki 'sellerId' ki jagah seller ka poora object aa jaye (Frontend ko companyName chahiye)
    // 3. .sort({ createdAt: -1 }) se naye products top par aayenge
    
    const products = await Product.find({})
      .populate("seller", "companyName fullName email status gstNumber img") // Sirf zaroori fields populate kar rahe hain
      .sort({ createdAt: -1 });

    // Agar products nahi hain
    if (!products || products.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No products found in the catalog.",
        data: [],
      });
    }

    // Success Response frontend ko bhej do
    res.status(200).json({
      success: true,
      count: products.length,
      data: products, // Ye array tera frontend seedha render karega
    });

  } catch (error) {
    console.error("Fetch Products Error:", error);
    res.status(500).json({
      success: false,
      message: "System error! Cannot fetch products.",
      error: error.message,
    });
  }
};


// 🚪 3. Admin Logout (Jo tu sidebar se hit karega)
const logoutAdmin = (req, res) => {
 res.cookie("adminToken", "", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  expires: new Date(0),
});
};

module.exports = {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getAllSellers,
  updateSellerStatus,
  createProduct,
  getAllProducts,
};
