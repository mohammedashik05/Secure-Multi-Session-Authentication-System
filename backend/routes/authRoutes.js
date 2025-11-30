const express =require("express");
const router =express.Router();
const {
    register,
    login,
    googleLogin,
    me,
    logout
} =require("../controllers/authController");
const {protect} =require("../middleware/authMiddleware");


router.post("/register",register);
router.post("/login",login);
router.post("/google",googleLogin);
router.get("/me",protect,me);
router.post("/logout",protect,logout);


module.exports=router;