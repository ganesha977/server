const express=require("express")
const authMiddleware = require('../middlewere/auth-middlewere');
const admincontroller=require("../controllers/admin-controller");
const adminmiddlewere = require('../middlewere/admin-middlewere');

const router=express.Router();


router.get('/users', authMiddleware,adminmiddlewere,admincontroller );

  // User authentication route
  router.get('/admin-auth', authMiddleware,adminmiddlewere, (req, res) => {
    res.status(200).json({ ok: true,message:"welcome admin" });
  });

  router.get('/user-auth', authMiddleware, (req, res) => {
    res.status(200).json({ ok: true });
  });

  



module.exports = router;