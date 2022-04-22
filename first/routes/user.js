const express = require("express");
const {
   getUser,
   updateUser,
   updateDP,
   getUsers,
   reportUser,
   follow,
   unfollow,
   getFriends,
   getUsersByIDs,
} = require("../controllers/user");
const router = express.Router();

router.route("/").get(getUsers);
router.route("/multiple").get(getUsersByIDs);
router.route("/:id").get(getUser);
router.route("/update").patch(updateUser);
router.route("/follow/:id").put(follow);
router.route("/report").patch(reportUser);
router.route("/update/dp").patch(updateDP);
router.route("/unfollow/:id").put(unfollow);
router.route("/friends/:userId").get(getFriends);


module.exports = router;
