const adminModel = require('../../models/Admin.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const seller = require('../../models/sellerModel.js')
const Product = require('../../models/Product.js')
const Inquiry = require('../../models/Inquiry.js')


// admin register function
async function adminregister(req, res) {
    try {
        const { username, email, password } = req.body;
        // admin 1 se jyada register na ho iske liye condition lagaya hai
        const checkAdmin  = await adminModel.countDocuments();
        if (checkAdmin >= 1) {
            return res.status(400).json({
                message: "Admin already registered",
            });
        }

        const isAdminAlreadyRegistered = await adminModel.findOne({ email });

        if (isAdminAlreadyRegistered) {
            return res.status(400).json({
                message: "Admin already registered",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = new adminModel({
            username,
            email,
            password: hashedPassword,
        });

        await admin.save();   

        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token);

        return res.status(201).json({
            message: "Admin registered successfully",
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
            },
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: err.message,
        });
    }
}


// admin login function
async function adminlogin(req, res) {
    const { email, password } = req.body;
    const admin = await adminModel.findOne({ email });
    if (!admin) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // Token generate karo
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // 🔥 FIX: Cookie hatayi, token JSON response mein bheja
    res.status(200).json({
        message: 'Admin logged in successfully',
        token: token, // 🔥 Token yahan bhej
        admin: {
            id: admin._id,
            username: admin.username,
            email: admin.email,
        }
    });
}

// admin logut function
async function adminlogout(req, res) {
    res.clearCookie('token');
    res.status(200).json({ message: 'Admin logged out successfully' });
}

// Admin.controller.js
async function getAllSeller(req, res){
    try {
        const sellers = await seller.aggregate([
            {
                $lookup: {
                    from: "products", // Tere Product collection ka naam (usually lowercase plural hota hai)
                    localField: "_id",
                    foreignField: "sellerId",
                    as: "sellerProducts"
                }
            },
            {
                $addFields: {
                    productCount: { $size: "$sellerProducts" } // Array ka size count kar lega
                }
            },
            {
                $project: {
                    password: 0, // Password frontend pe nahi bhejna chahiye
                    sellerProducts: 0 // Poora array hatakar sirf count bhejenge
                }
            }
        ]);
        res.status(200).json({ success: true, sellers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
async function getItemOfSeller(req, res) {
    try {

        const { sellerId } = req.params;

        // Optional: check seller exists
        const sellerData = await seller.findById(sellerId);

        if (!sellerData) {
            return res.status(404).json({
                success: false,
                message: "Seller not found"
            });
        }

        const products = await Product.find({
            sellerId: sellerId
        });

        return res.status(200).json({
            success: true,
            products
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }
}
async function getAllInquiries(req, res) {
    try {
        console.log("🔥 Admin fetching global inquiries..."); 
        
        // 1. Populate lagaya taaki ID ki jagah actual naam aa jaye
        const inquiries = await Inquiry.find()
            .populate("sellerId", "businessName") // 🔥 Seller ka data map karega
            .populate("productId", "productName") // Agar product bhi ID se juda hai, toh wo bhi nikal lega
            .sort({ createdAt: -1 })
            .lean(); // Data processing fast karne ke liye

        // 2. Frontend ko 'sellerName' chahiye, toh hum format kar dete hain
        const formattedInquiries = inquiries.map(inq => ({
            ...inq,
            // Agar populate hua hai toh businessName set karo, warna fallback
            sellerName: inq.sellerId?.businessName || inq.sellerName || "Unknown Seller",
            // Product name fallback
            productName: inq.productId?.productName || inq.productName || "Unknown Product"
        }));
        
        console.log(`✅ Success! Sent ${formattedInquiries.length} inquiries to Admin.`);
        return res.status(200).json({ success: true, inquiries: formattedInquiries });

    } catch (err) {
        console.error("❌ Backend Error in getAllInquiries:", err); 
        return res.status(500).json({ success: false, message: err.message });
    }
}


module.exports = {
    adminregister,
    adminlogin,
    adminlogout,
    getAllSeller,
    getItemOfSeller,
    getAllInquiries
};