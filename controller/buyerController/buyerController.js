const Product = require("../../models/Product");


exports.getAllProducts = async (req, res) => {
  try {
    // Sirf approved/verified products dikhane ho toh find condition laga sakte ho
    const products = await Product.find().sort({ createdAt: -1 }); 
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};
