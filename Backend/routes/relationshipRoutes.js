const express = require("express");
const relationshipController = require("../controllers/relationshipController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();
 
router.get(
  "/sendRequest/:userId",
  verifyToken,
  relationshipController.sendRequest
);

router.get(
  "/pendingRequestList",
  verifyToken,
  relationshipController.pendingRequestList
);

router.get(
  "/acceptRequest/:uid",
  verifyToken,
  relationshipController.acceptRequest
);

router.get(
  "/deleteRequest/:uid",
  verifyToken,
  relationshipController.deleteRequest
);

router.get(
  "/getAcceptedRequestList",
  verifyToken,
  relationshipController.getAcceptedRequestList
);

router.get(
  "/unfollowUser/:uid",
  verifyToken,
  relationshipController.unfollowUser
);
router.get(
  "/getFollowingFollowersList/:status",
  verifyToken,
  relationshipController.getFollowingFollowersList
);



router.get(
  "/suggestProfiles",
  verifyToken,
  relationshipController.suggestProfiles
);
module.exports = router;
