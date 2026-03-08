const express = require("express");
const spinPromptController = require("../controllers/spinPromptController");
const { verifyToken } = require("../middleware/auth");
const upload = require("../middleware/fileUpload");

const router=express.Router();

router.get("/getNewPrompt", verifyToken, spinPromptController.sendPrompt);
router.post("/createPromptPost",verifyToken,upload.single("media"),spinPromptController.createPromptPost);
router.get("/getOwnPromptPost", verifyToken, spinPromptController.getOwnPromptPost);
router.get("/getOtherPromptPost", verifyToken, spinPromptController.getOtherPromptPost);

module.exports = router;
