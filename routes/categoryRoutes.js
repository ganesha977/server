const express = require('express');
const authMiddleware = require('../middlewere/auth-middlewere');
const adminmiddlewere = require('../middlewere/admin-middlewere');
const formidable = require("express-formidable");
const categoryController = require('../controllers/categoryController');
const router = express.Router();

// Create Category
router.post(
  '/create-category',
  authMiddleware,       // Check if the user is authenticated
  adminmiddlewere,      // Check if the user has admin privileges
  formidable(),         // Parse form data including files
  categoryController.createCategoryController
);

// Update Category
router.put(
  "/update-category/:id",
  authMiddleware,       // Check if the user is authenticated
  adminmiddlewere,      // Check if the user has admin privileges
  formidable(),         // Parse form data including files
  categoryController.updateCategoryController
);

// Get All Categories
router.get(
  "/get-category",
  categoryController.categoryControlller
);

// Get Single Category
router.get(
  "/single-category/:slug",
  authMiddleware,       // Check if the user is authenticated
  categoryController.singleCategoryController
);

// Delete Category
router.delete(
  "/delete-category/:id",
  authMiddleware,       // Check if the user is authenticated
  adminmiddlewere,      // Check if the user has admin privileges
  categoryController.deleteCategoryController
);


router.get('/category-image/:id', categoryController.getCategoryImageController);



module.exports = router;
