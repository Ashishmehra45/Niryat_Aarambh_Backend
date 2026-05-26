const cloudinary = require('cloudinary').v2;
const path = require('path');
const dotenv = require('dotenv');

// 🔥 FIX 1: Try multiple paths to ensure .env is definitely loaded!
const envPath1 = path.resolve(__dirname, '../.env');  // Agar file services/ me hai
const envPath2 = path.resolve(__dirname, '../../.env'); // Agar file aur andar hai

if (require('fs').existsSync(envPath1)) {
  dotenv.config({ path: envPath1 });
} else {
  dotenv.config({ path: envPath2 });
}

// 🔥 FIX 2: Debugger - Server start hote hi ye bata dega .env mili ya nahi
console.log("------- CLOUDINARY CONFIG CHECK -------");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ Found" : "❌ MISSING");
console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "✅ Found" : "❌ MISSING");
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "✅ Found" : "❌ MISSING");
console.log("---------------------------------------");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;