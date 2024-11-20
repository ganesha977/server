const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/usermodel");
const Order = require("../models/orderModel");

const productmodel =require("../models/productmodel.js")
require("dotenv").config();

const home = async (req, res) => {
  try {
    res.status(200).json({ msg: "Welcome to our home page" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};











const register = async (req, res) => {
  try {
    const { name, email, phone, password, address, answer } = req.body;

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const userCreated = await User.create({ name, email, phone, password, address, answer });
    const token = await userCreated.generateToken();

    res.status(201).json({
      msg: "Registration Successful",
      token: token,
      userId: userCreated._id.toString(),
      user: userCreated,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await userExist.comparePassword(password);
    if (isPasswordValid) {
      const token = await userExist.generateToken();
      res.status(200).json({
        msg: "Login Successful",
        token,
        userId: userExist._id.toString(),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


















const userProfileController = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Ensure the user is accessing their own profile or is an admin
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Forbidden. You can't access this profile." });
    }

    const user = await User.findById(userId).select('name email phone address'); // Adjust fields as needed

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      userData: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};





const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;

    // Validate input
    if (!email || !answer || !newPassword) {
      return res.status(400).json({
        message: "Email, answer, and new password are required",
      });
    }

    // Check if user exists with the provided email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    // Validate the security answer
    if (user.answer !== answer) {
      return res.status(400).json({
        success: false,
        message: "Incorrect security answer",
      });
    }

    // Set the new password (hashing is handled by the pre-save hook)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};














const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await User.findById(req.user._id);

    // Password validation
    if (password && password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Update user profile without manually hashing the password
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: password ? password : user.password, // Password will be hashed by pre-save hook
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Profile Updated Successfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error While Updating Profile",
      error,
    });
  }
};


const getAllOrdersController = async (req, res) => {
  try {
    // Use the logged-in user's ID to filter orders
    const orders = await Order
      .find({ buyer: req.user._id })
 
       // Filter orders by the logged-in user
      .populate({
        path: 'products.product',
        model: 'Product',
        select: 'name price images',  // Include name, price, and images fields
      })
      .populate("buyer", "name")  // Only include the 'name' field from the buyer
      .sort({ createdAt: -1 });  // Sort by creation date, newest first
      console.log('Authenticated User:', req.user);

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting orders",
      error,
    });
  }
};



// controllers/orderControllers.js

// Get single order by ID (or slug if implemented)
const getOrderByIdController = async (req, res) => {
  try {
    const order = await Order
      .findById(req.params.id)  // Find by order ID (can be adapted to use slug)
      .populate({
        path: 'products.product',
        model: 'Product',
        select: 'name price images description',
      })
      .populate('buyer', 'name');  // Fetch buyer name

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order details',
      error,
    });
  }
};






const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate({
        path: "products.product", // Assuming 'product' is the field name inside 'products'
        select: "name description price discountedPrice quantity images",
      })
      .populate({
        path: "buyer",
        select: "name",
      })
      .sort({ createdAt: -1 }); // Optionally, sort by creation date

    console.log("Populated orders:", orders);  // Check the output in the console

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting orders",
      error,
    });
  }
};


const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Updateing Order",
      error,
    });
  }
};


// Controller function to get total counts
const getTotalCounts = async (req, res) => {
  try {
    // Count total users
    const totalUsers = await User.countDocuments();

    // Count total products
    const totalProducts = await productmodel.countDocuments();

    // Count total orders
    const totalOrders = await Order.countDocuments();

    // Calculate total sales
    const orders = await Order.find({}, 'payment'); // Fetch only the payment field
    let totalSales = 0;

    // Sum the amounts manually
    for (const order of orders) {
      if (order.payment && order.payment.amount) {
        totalSales += order.payment.amount;
      }
    }

    // Respond with the counts
    res.status(200).json({
      success: true,
      totalUsers,
      totalProducts,
      totalOrders,
      totalSales, // Include totalSales in the response
    });

    // Log the counts
    console.log('Total Users:', totalUsers);
    console.log('Total Products:', totalProducts);
    console.log('Total Orders:', totalOrders);
    console.log('Total Sales:', totalSales);

  } catch (error) {
    console.error('Error fetching counts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch counts',
    });
  }
};






module.exports = { home, register, login, userProfileController,getAdminOrders ,updateProfileController,getAllOrdersController,orderStatusController,getTotalCounts,getOrderByIdController,forgotPasswordController};
