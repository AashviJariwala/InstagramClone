const express = require("express");
const postController = require("../controllers/postController");
const { verifyToken } = require("../middleware/auth");
const upload = require("../middleware/fileUpload");

const router=express.Router();

router.post("/create", verifyToken, upload.array("media",15), postController.createPost);
router.get("/getOtherPost", verifyToken, postController.getOtherPost);
router.get("/getOtherReel", verifyToken, postController.getOtherReel);
router.get("/getOwnPost", verifyToken, postController.getOwnPost);
router.get("/getOwnReel", verifyToken, postController.getOwnReel);
router.get("/getUserPost/:id", verifyToken, postController.getUserPost);
router.get("/getUserReel/:id", verifyToken, postController.getUserReel);



module.exports = router;
