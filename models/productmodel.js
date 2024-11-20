const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discountedPrice: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  category: {
    type: mongoose.ObjectId,
    ref: "Category",
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  images: [
    {
      public_id: String,
      url: String,
    },
  ],
  shipping: {
    type: Boolean
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Product", productSchema);
