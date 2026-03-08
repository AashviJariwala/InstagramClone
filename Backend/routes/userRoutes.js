const express = require("express");
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth");
const upload = require("../middleware/fileUpload");

const router = express.Router();

router.put("/editProfile", verifyToken, upload.single("profile"), userController.editProfile);
router.put("/updateUserDetails", verifyToken, userController.updateUserDetails);
router.get(
  "/showPrivacyStatus",
  verifyToken,
  userController.showPrivacyStatus
);
router.get(
  "/updatePrivacyStatus/:is_private",
  verifyToken,
  userController.updatePrivacyStatus
);
router.get(
  "/searchUser/:id",
  verifyToken,
  userController.searchUser
);
router.get(
  "/searchOwnProfile/:id",
  verifyToken,
  userController.searchOwnProfile
);
router.get(
  "/userProfile",
  verifyToken,
  userController.userProfile
);

module.exports = router;
