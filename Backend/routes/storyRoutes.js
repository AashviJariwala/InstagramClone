const express = require("express");
const storyController = require("../controllers/storyController");
const { verifyToken } = require("../middleware/auth");
const upload = require("../middleware/fileUpload");

const router=express.Router();

router.post("/uploadStory",verifyToken,upload.single("media"),storyController.uploadStory);
router.get("/getAllStory",verifyToken,storyController.getAllStory);
router.get("/storyStatus",verifyToken,storyController.storyStatus);
router.get("/getUserStory/:id",verifyToken,storyController.getUserStory);


module.exports=router;