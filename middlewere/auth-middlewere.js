const jwt = require("jsonwebtoken");
//doten import
const dotenv = require("dotenv");
const User = require("../models/usermodel");
dotenv.config();  

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized HTTP, Token not provided" });
  }

  // Remove "Bearer" prefix
  const jwtToken = token.replace("Bearer", "").trim();
  console.log(jwtToken);

  try {
    // Verifying the token
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);

    // Get user data and exclude password
    const userData = await User.findOne({ email: decoded.email }).select("-password");
    if (!userData) {
      return res.status(401).json({ message: "Unauthorized. Invalid token." });
    }

    req.token = jwtToken;
    req.user = userData;
    req.userID = userData._id;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Unauthorized. Invalid token." });
  }
};

module.exports = authMiddleware;