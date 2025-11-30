const express =require("express");
const router =express.Router();


const {
    getMySessions,
    deleteSession,
    logoutAllSessions,
} =require("../controllers/sessionController");

const {protect} = require("../middleware/authMiddleware");


router.get("/my",protect,getMySessions);
router.delete("/:sid",protect,deleteSession);
router.delete("/all/logout",protect,logoutAllSessions);




module.exports =router;