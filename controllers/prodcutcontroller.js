const fs = require("fs");
const slugify = require("slugify");
const productModel = require("../models/productmodel");
const categoryModel = require("../models/categorymodel");
const Order = require("../models/orderModel");

const cloudinary = require("cloudinary");
const getDataUri = require("../config/datauri.js");

// dotenv config
const dotenv = require("dotenv");
const carouselimage = require("../models/carouselimage.js");
dotenv.config();

console.log(process.env);

const createProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      quantity,
      shipping,
      discountedPrice,
      discount,
      rating,
    } = req.body; // Assuming you use req.body for other fields

    // Validate required fields
    if (!name) return res.status(400).send({ error: "Name is Required" });
    if (!description) return res.status(400).send({ error: "Description is Required" });
    if (!price) return res.status(400).send({ error: "Price is Required" });
    if (!category) return res.status(400).send({ error: "Category is Required" });
    if (!quantity) return res.status(400).send({ error: "Quantity is Required" });
    if (!discountedPrice) return res.status(400).send({ error: "Discounted Price is Required" });
    if (!discount) return res.status(400).send({ error: "Discount is Required" });
    if (!rating) return res.status(400).send({ error: "Rating is Required" });

    // Convert shipping to Boolean
    const shippingValue = shipping === "Yes" || shipping === true;

    // Handle file uploads using Cloudinary
    const images = [];
    if (req.files) {
      for (const file of req.files) {
        const fileUri = getDataUri(file); // Convert file to data URI
        const cdb = await cloudinary.uploader.upload(fileUri); // Upload to Cloudinary
        images.push({
          public_id: cdb.public_id,
          url: cdb.secure_url,
        });
      }
    }

    // Create new product
    const product = new productModel({
      name,
      description,
      price,
      category,
      quantity,
      shipping: shippingValue,
      discountedPrice,
      discount,
      rating,
      slug: slugify(name),
      images, // Save Cloudinary image info to `images`
    });

    // Save the product to the database
    await product.save();

    // Send response
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      product,
    });
  } catch (error) {
    console.error("Error in createProductController:", error);
    res.status(500).send({
      success: false,
      message: "Error in creating product",
      error: error.message,
    });
  }
};




const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate({
        path: 'category', // Ensure category is correctly populated
        select: 'name slug', // Only select necessary fields from category
      })
      .select('-images.data') // Exclude binary data from images
      .limit(12)
      .sort({ createdAt: -1 });

    // Format products and ensure `stocks` is a boolean
    const formattedProducts = products.map(product => ({
      ...product.toObject(),
      stocks: product.stocks === true || product.stocks === 'true',
      images: product.images.map(img => img.url) // Map the images field to URLs
    }));

    res.status(200).send({
      success: true,
      countTotal: products.length,
      message: 'All Products',
      products: formattedProducts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error in getting products',
      error: error.message,
    });
  }
};




const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .populate({
        path: "category",
        select: "name slug" // Only select relevant fields from category
      })
      .select("-images.data") // Exclude binary image data from product's images field

    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });

    console.log(product);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting single product",
      error,
    });
  }
};






const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("images");
    
    if (!product || !product.images || product.images.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No images found for this product",
      });
    }

    // Return the list of images (public_id and URL from Cloudinary)
    res.status(200).json({
      success: true,
      images: product.images,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while getting photos",
      error,
    });
  }
};



    const updateProductController = async (req, res) => {
      try {
        const {
          name,
          description,
          price,
          category,
          quantity,
          shipping,
          discountedPrice,
          discount,
          rating,
        } = req.body;
        const { pid } = req.params; // Product ID from URL parameters

        // Validate required fields
        if (!pid) return res.status(400).send({ error: "Product ID is Required" });

        // Find the existing product
        const product = await productModel.findById(pid);
        if (!product) return res.status(404).send({ error: "Product Not Found" });

        // Update fields if they are provided
        if (name) product.name = name;
        if (description) product.description = description;
        if (price) product.price = price;
        if (category) product.category = category;
        if (quantity) product.quantity = quantity;
        if (shipping) product.shipping = shipping === "Yes" || shipping === true;
        if (discountedPrice) product.discountedPrice = discountedPrice;
        if (discount) product.discount = discount;
        if (rating) product.rating = rating;

        // Handle file uploads using Cloudinary
        if (req.files) {
          const images = [];
          for (const file of req.files) {
            const fileUri = getDataUri(file); // Convert file to data URI
            const cdb = await cloudinary.uploader.upload(fileUri); // Upload to Cloudinary
            images.push({
              public_id: cdb.public_id,
              url: cdb.secure_url,
            });
          }
          product.images = images; // Update product images
        }

        // Save the updated product to the database
        await product.save();

        // Send response
        res.status(200).send({
          success: true,
          message: "Product Updated Successfully",
          product,
        });
      } catch (error) {
        console.log(error)
        console.error("Error in updateProductController:", error);
        res.status(500).send({
          success: false,
          message: "Error in updating product",
          error: error.message,
        });
      }
    };











const deleteProductController = async (req, res) => {
  try {
    // Find the product by ID
    const product = await productModel.findById(req.params.pid);

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",

      });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        try {
          await cloudinary.uploader.destroy(image.public_id);
        } catch (deleteError) {
          console.error("Error deleting image:", deleteError);
          console.log(error)
          // Continue deleting other images if one fails
        }
      }
    }

    // Delete the product
    await productModel.findByIdAndDelete(req.params.pid);

    res.status(200).send({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error while deleting product:", error);
    console.log(error)
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error: error.message,
    });
  }
};







//here are non crud operations

// const productFiltersController = async (req, res) => {
//   try {
//     const { checked = [], radio = [] } = req.body;
//     let filterArgs = {};

//     // Add category filter if any
//     if (checked.length > 0) {
//       filterArgs.category = { $in: checked };
//     }

//     // Add price range filter if provided
//     if (radio.length === 2) {
//       // Ensure radio is an array with two elements
//       const [minPrice, maxPrice] = radio.map(Number); // Convert to numbers
//       // Ensure the minPrice and maxPrice are valid numbers
//       if (
//         !isNaN(minPrice) &&
//         !isNaN(maxPrice) &&
//         minPrice >= 0 &&
//         maxPrice >= minPrice
//       ) {
//         filterArgs.price = { $gte: minPrice, $lte: maxPrice };
//       } else {
//         return res.status(400).send({
//           success: false,
//           message: "Invalid price range",
//         });
//       }
//     }

//     // Fetch filtered products
//     const products = await productModel.find(filterArgs);

//     res.status(200).send({
//       success: true,
//       products,
//     });
//   } catch (error) {
//     console.error("Error in filtering products:", error);
//     res.status(400).send({
//       success: false,
//       message: "Error while filtering products",
//       error: error.message,
//     });
//   }
// };
const productFiltersController = async (req, res) => {
  try {
    const { checked = [], radio = [] } = req.body;
    let filterArgs = {};

    // Add category filter if any
    if (checked.length > 0) {
      filterArgs.category = { $in: checked };
    }

    // Add price range filter if provided and valid
    if (radio.length === 2) {
      const [minPrice, maxPrice] = radio.map(Number);
      
      if (!isNaN(minPrice) && !isNaN(maxPrice) && minPrice >= 0 && maxPrice >= minPrice) {
        filterArgs.price = { $gte: minPrice, $lte: maxPrice };
      } else {
        return res.status(400).send({
          success: false,
          message: "Invalid price range",
        });
      }
    }

    // Fetch filtered products
    const products = await productModel.find(filterArgs);

    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error in filtering products:", error);
    res.status(400).send({
      success: false,
      message: "Error while filtering products",
      error: error.message,
    });
  }
};


const productcountcontroller = async (req, res) => {
  try {
    const total = await productModel.countDocuments(); // countDocuments is preferable for accuracy
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.error("Error while counting products:", error);
    res.status(400).send({
      success: false,
      message: "Error while counting products",
      error: error.message,
    });
  }
};

const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select({}); // Update from -photo to -images
    res.json(results);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error In Search Product API",
      error,
    });
  }
};

// const productListController = async (req, res) => {
//   try {
//     const perPage = 6;
//     const page = parseInt(req.params.page) || 1;
//     const products = await productModel
//       .find({})
//       .skip((page - 1) * perPage)
//       .limit(perPage)
//       .sort({ createdAt: -1 });
//     const total = await productModel.countDocuments(); // Get total product count
//     res.status(200).send({
//       success: true,
//       products,
//       total,
//       perPage,
//       page,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(400).send({
//       success: false,
//       message: "Error in per page product list",
//       error: error.message,
//     });
//   }
// };

const productListController = async (req, res) => {
  try {
    const perPage = 6; // Set items per page
    const page = parseInt(req.params.page) || 1; // Get the current page
    const products = await productModel
      .find({})
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    const total = await productModel.countDocuments(); // Total count of products
    res.status(200).send({
      success: true,
      products,
      total,
      perPage,
      page,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error in per page product list",
      error,
    });
  }
};



const getrelatedproduct = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    console.log("Category ID:", cid);
    console.log("Product ID:", pid);

    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(4)
      .populate({
        path: "category",
        select: "name slug"
      });

    console.log("Related Products:", products); // Log the fetched products

    res.status(200).send({
      success: true,
      products
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in related product list",
      error: error.message,
    });
  }
};



const getProductsByCategoryController = async (req, res) => {
  try {
    // Find the category by slug
    const category = await categoryModel.findOne({ slug: req.params.slug });

    // If no category found, return an error
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    // Fetch products associated with this category's _id
    const products = await productModel
      .find({ category: category._id })
      .populate("category")
      .select("images"); // Update from -photo to -images

    // Send the response with the found products
    res.status(200).json({
      success: true,
      message: `Products for category ${category.name}`,
      products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in fetching products by category",
      error: error.message,
    });
  }
};

// const productCategoryController = async (req, res) => {
//   try {
//     const category = await categoryModel.findOne({ slug: req.params.slug });
//     const products = await productModel
//       .find({ category })
//       .populate("category")
//       .select({}); // Update from -photo to -images
//     res.status(200).send({
//       success: true,
//       category,
//       products,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(400).send({
//       success: false,
//       error,
//       message: "Error While Getting products",
//     });
//   }
// };


const productCategoryController = async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 6 } = req.query; // Default to 6 items per page

    // Convert pagination parameters to integers
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    // Validate pagination parameters
    if (pageNumber <= 0 || pageSize <= 0) {
      return res.status(400).send({
        success: false,
        message: 'Invalid pagination parameters.',
      });
    }

    // Fetch category data
    const category = await categoryModel.findOne({ slug });

    if (!category) {
      return res.status(404).send({
        success: false,
        message: 'Category not found.',
      });
    }

    // Count total products in the category
    const totalProducts = await productModel.countDocuments({ category });

    // Fetch products with pagination
    const products = await productModel
      .find({ category })
      .populate('category')
      .skip((pageNumber - 1) * pageSize) // Skip products based on page number
      .limit(pageSize) // Limit the number of products per page
      .select({}); // Adjust fields as needed

    res.status(200).send({
      success: true,
      category,
      products,
      totalProducts, // Send total product count for client-side pagination controls
      totalPages: Math.ceil(totalProducts / pageSize), // Calculate total pages
      currentPage: pageNumber, // Send current page number
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: 'Error while getting products',
    });
  }
};


// Route for getting products by category with pagination


const dummyPaymentController = async (req, res) => {
  try {
    const { cart } = req.body; // No paymentMethod needed
    let total = 0;

    // Calculate the total amount
    cart.forEach((item) => {
      total += item.price * item.quantity;
    });

    // Create a new order object with products and buyer information
    const order = new Order({
      products: cart.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
      })),
      buyer: req.user._id,
      status: "Not Process",
      payment: {
        status: "Success", // Default payment status
        transactionId: "dummyTransactionId123" // Dummy transaction ID
      },
    });

    await order.save();

    res.json({ ok: true, totalAmount: total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'An error occurred' });
  }
};





// Carousel Image Controller
const uploadCarouselImagesController = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files were uploaded.",
      });
    }

    const images = [];
    for (const file of req.files) {
      const fileUri = getDataUri(file);
      const result = await cloudinary.uploader.upload(fileUri);

      const newImage = {
        public_id: result.public_id,
        url: result.secure_url,
      };

      const carouselImage = await carouselimage.create(newImage);
      images.push(carouselImage);
    }

    res.status(201).json({
      success: true,
      message: "Carousel images uploaded successfully.",
      images,
    });
  } catch (error) {
    console.error("Error in uploadCarouselImagesController:", error);
    res.status(500).json({
      success: false,
      message: "Error while uploading carousel images",
      error: error.message,
    });
  }
};

const updateCarouselImagesController = async (req, res) => {
  try {
    const { id } = req.params; // Image ID from URL parameter
    const { public_id, url } = req.body; // New data for the image

    // Validate input
    if (!public_id || !url) {
      return res.status(400).json({
        success: false,
        message: "Public ID and URL are required.",
      });
    }

    // Find the image by ID and update it
    const updatedImage = await carouselimage.findByIdAndUpdate(
      id,
      { public_id, url },
      { new: true }
    );

    if (!updatedImage) {
      return res.status(404).json({
        success: false,
        message: "Image not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Image updated successfully.",
      image: updatedImage,
    });
  } catch (error) {
    console.error("Error in updateCarouselImagesController:", error);
    res.status(500).json({
      success: false,
      message: "Error while updating the image",
      error: error.message,
    });
  }
};

const deleteCarouselImagesController = async (req, res) => {
  try {
    const { id } = req.params; // Image ID from URL parameter

    // Find the image by ID
    const image = await carouselimage.findById(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found.",
      });
    }

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(image.public_id);

    // Remove image from database
    await carouselimage.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteCarouselImagesController:", error);
    res.status(500).json({
      success: false,
      message: "Error while deleting the image",
      error: error.message,
    });
  }
};




const getci=("/carousel-images", async (req, res) => {
  try {
    const images = await carouselimage.find(); // Replace with your method to fetch images
    res.json({
      success: true,
      images,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching carousel images",
      error: error.message,
    });
  }
});








module.exports = {
  getProductController,
  createProductController,
  
  getSingleProductController,
  updateProductController,
  deleteProductController,
  productFiltersController,
  productListController,
  searchProductController,
  productcountcontroller,
  getrelatedproduct,
  getProductsByCategoryController,
  productCategoryController,

  dummyPaymentController,
  productPhotoController
  ,uploadCarouselImagesController,
getci,
updateCarouselImagesController,deleteCarouselImagesController
};

