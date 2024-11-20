const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/auth-controller");
const validate = require("../middlewere/validate-middlewere");
const signupSchema = require("../validators/auth-validate");
const User = require("../models/usermodel");
const authMiddleware = require("../middlewere/auth-middlewere");






router.route("/").get(authControllers.home);
router
  .route("/register")
  .post(validate(signupSchema), authControllers.register);



//   // User authentication route
// router.get('/user-auth', authMiddleware, (req, res) => {
//   res.status(200).json({ ok: true });
// });

router.get("/protected", authMiddleware, (req, res) => {
  res.status(200).json({ message: "This is a protected route", user: req.user });
});

router.route("/login").post(authControllers.login);
router.route("/forgot-password").post(authControllers.forgotPasswordController);




router.get('/user-info', authMiddleware, async (req, res) => {
  try {
    // Assuming req.user is populated by your authMiddleware
    const user = await User.findById(req.user.id); // Adjust according to your model and middleware
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ userData: user }); // Return user data
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


  // User authentication route
router.get('/user-auth', authMiddleware, (req, res) => {
  res.status(200).json({ ok: true });
});

router.get("/protected", authMiddleware, (req, res) => {
  res.status(200).json({ message: "This is a protected route", user: req.user });
})

router.get('/check-user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (user) {
      res.status(200).json({
        success: true,
        message: 'User found',
        user
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    console.log('Error in check-user route:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking user', 
      error
    });
  }
});

router.get('/user/profile', authMiddleware, authControllers.userProfileController);

// router.put("/profile", authMiddleware,authControllers.updateProfileController);



router.get("/orders",authMiddleware,authControllers.getAllOrdersController)
router.get('/orders/:id', authMiddleware, authControllers.getOrderByIdController);

router.get("/all-orders",authMiddleware,authMiddleware,authControllers.getAdminOrders)
  router.put("/status/:orderId",authMiddleware,authMiddleware,authControllers.orderStatusController);

router.get("/counter",authControllers.getTotalCounts)



module.exports = router;