const Product = require("../../models/Product");
const Inquiry = require("../../models/Inquiry");
const Requirement = require("../../models/Requirement");


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

exports.createRequirement = async (req, res) => {
 try {
    const { buyerName, buyerPhone, productName, quantity, unit } = req.body;

    // 1. Backend Validation (always double-check on the server)
    if (!buyerName || !buyerPhone || !productName || !quantity) {
      return res.status(400).json({ 
        success: false, 
        message: "Please fill in all the required fields." 
      });
    }

    // 2. Create a new document using the Model
    const newRequirement = new Requirement({
      buyerName,
      buyerPhone,
      productName,
      quantity,
      unit
    });

    // 3. Save to database
    await newRequirement.save();

    // 4. Send success response to frontend
    res.status(201).json({
      success: true,
      message: "Requirement posted successfully!",
      data: newRequirement
    });

  } catch (error) {
    console.error("Error posting requirement:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to post requirement. Server error." 
    });
  }
};
