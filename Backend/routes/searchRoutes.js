const express = require("express");
const searchController = require("../controllers/searchController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/searchProfiles/:query",
  verifyToken,
  searchController.searchProfiles
);
// router.get(
//   "/userProfile",
//   verifyToken,
//   userController.userProfile
// );

module.exports = router;
