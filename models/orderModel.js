const mongoose = require("mongoose");

// Define the order schema
const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId, // Correct type for ObjectId
          ref: "Product", // Reference to Product model
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    payment: {
      status: {
        type: String,
        enum: ["Pending", "Success", "Failed"], // Enum values for payment status
        default: "Pending", // Default value
      },
      transactionId: {
        type: String, // Optional field for payment transaction ID
      },
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId, // Correct type for ObjectId
      ref: "User", // Reference to User model
    },
    status: {
      type: String,
      default: "Not Process",
      enum: ["Not Process", "Processing", "Shipped", "Delivered", "Cancelled"], // Enum values
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Export the model
module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
