const router = require("express").Router();
const { authenticateToken } = require("../controllers/authController");
const {
  follow,
  getUsers,
  userData,
  setAvatar,
  searchUsers,
} = require("../controllers/usersController");

router.post("/setavatar/:id", authenticateToken, setAvatar);
router.get("/search/:term", authenticateToken, searchUsers);
router.get("/users", authenticateToken, getUsers);
router.get("/:username", authenticateToken, userData);
router.post("/follow/:id", authenticateToken, follow);
module.exports = router;
