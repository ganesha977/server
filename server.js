const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
const cloudinary = require("cloudinary");
const cors = require("cors");
const authRoutes = require("./routes/auth-route");
const adminRoutes = require("./routes/admin-route");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoute");

dotenv.config(); // Load environment variables before using them
connectDB(); // Connect to the database

const app = express();

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Updated CORS configuration
const corsOptions = {
  origin: [
    "https://rahulecom.netlify.app",
    "http://localhost:5173", // Development environment
  ],
  methods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  credentials: true, // Allow cookies if needed
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests

app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" })); // Increase payload limit if needed

// Route Middleware
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

app.get("/", (req, res) => {
  res.send({ msg: "send your application" });
});

const PORT = process.env.PORT || 7777;

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.DEV_MODE} on port ${PORT}`);
});
