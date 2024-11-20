const express = require("express");
const authMiddleware = require("../middlewere/auth-middlewere");
const adminMiddleware = require("../middlewere/admin-middlewere");
const {
  createProductController,
  updateProductController,
  getProductController,
  getSingleProductController,
  productPhotoController,
  deleteProductController,
  productFiltersController,
  productcountcontroller,
  productListController,
  searchProductController,
  getrelatedproduct,
  getProductsByCategoryController,
  productCategoryController,
  braintreetokencontroller,
  braintreepaymentcontroller,
  dummyPaymentController,
  updateProductImageController,
  uploadCarouselImagesController,
  getci,
  updateCarouselImagesController,
  deleteCarouselImagesController,
} = require("../controllers/prodcutcontroller");
const { upload } = require("../middlewere/multer");
const carouselimage = require("../models/carouselimage");

const router = express.Router();

// Product CRUD Routes
router.post("/create-product", authMiddleware, adminMiddleware, upload, createProductController);
router.put("/update-product/:pid", authMiddleware, adminMiddleware, upload, updateProductController);
router.delete("/delete-product/:pid", authMiddleware, adminMiddleware, deleteProductController);

// Product Retrieval Routes
router.get("/get-products", getProductController);
router.get("/get-product/:slug", getSingleProductController);
router.get("/product-photo/:pid", productPhotoController);  

// Filtering and Searching
router.post("/product-filters", productFiltersController);
router.get("/product-count", productcountcontroller);
router.get("/product-list/:page", productListController);
router.get("/search/:keyword", searchProductController);

// Similar product
router.get("/similar-product/:pid/:cid", getrelatedproduct);

// Product category
router.get('/product-category/:slug', productCategoryController);

// Payment routes
router.post("/payment", authMiddleware, dummyPaymentController);
router.post("/uploadc", authMiddleware,adminMiddleware,upload, uploadCarouselImagesController);
router.post('/updatec/:id', authMiddleware, adminMiddleware, updateCarouselImagesController);

// Route for deleting existing carousel images
router.post('/deletec/:id', authMiddleware, adminMiddleware, deleteCarouselImagesController);

// Route for getting all carousel images (if needed)
router.get('/carousel-images',  getci);

// Example route in Express to get carousel images




module.exports = router;
