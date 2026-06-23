const Product = require("../../models/Product");
const Inquiry = require("../../models/Inquiry");


exports.getAllProducts = async (req, res) => {
  try {
    // Sirf approved/verified products dikhane ho toh find condition laga sakte ho
    const products = await Product.find().sort({ createdAt: -1 }); 
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};
exports.createInquiry = async (req, res) => {
  try {
    const { sellerId, productId, productName, buyerName, buyerEmail, buyerPhone, quantityRequired, unit, message } = req.body;

    if (!sellerId || !productId || !buyerName || !buyerEmail || !message) {
      return res.status(400).json({ error: "Please fill all mandatory fields." });
    }

    const newInquiry = new Inquiry({
      sellerId,
      productId,
      productName,
      buyerName,
      buyerEmail,
      buyerPhone,
      quantityRequired,
      unit,
      message
    });

    await newInquiry.save();
    res.status(201).json({ success: true, message: "Inquiry sent successfully to the supplier!" });

  } catch (error) {
    console.error("Inquiry Error:", error);
    res.status(500).json({ error: "Could not send inquiry. Try again." });
  }
};
