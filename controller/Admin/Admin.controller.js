const adminModel = require('../../models/Admin.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const seller = require('../../models/sellerModel.js')


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
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token);
    res.status(200).json({
         message: 'Admin logged in successfully',
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

async function getAllSeller(req, res){
    const sellers = await seller.find();
    res.status(200).json({ success: true, sellers });


}



module.exports = {
    adminregister,
    adminlogin,
    adminlogout,
    getAllSeller
};