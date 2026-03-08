const express = require("express");
const likeCommentController = require("../controllers/likeCommentController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.post("/likePost",verifyToken,likeCommentController.likePost);
router.post("/likeComment",verifyToken,likeCommentController.likeComment);
router.get("/getPostComments/:id",verifyToken,likeCommentController.getPostComments);
router.post("/commentPost",verifyToken,likeCommentController.commentPost);


module.exports=router;
