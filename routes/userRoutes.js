const router = require("express").Router();
const { authenticateToken } = require("../controllers/authController");
const {
  follow,
  getUsers,
  userData,
  setAvatar,
} = require("../controllers/usersController");

router.post("/setavatar/:id", setAvatar);
router.get("/users", authenticateToken, getUsers);
router.get("/:username", authenticateToken, userData);
router.post("/follow/:id", authenticateToken, follow);
module.exports = router;
