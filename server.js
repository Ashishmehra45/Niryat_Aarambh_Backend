const http = require("http");
const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/db");

// 🔹 env config
dotenv.config();



// 🔹 DB connect
connectDB();

// 🔹 port
const PORT = process.env.PORT

// 🔹 create server (socket ke liye future ready)
const server = http.createServer(app);

// 🔹 start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});