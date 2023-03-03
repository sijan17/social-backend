const {
  register,
  login,
  authenticateToken,
  checkAuth,
} = require("../controllers/authController");

const router = require("express").Router();
router.get("/", authenticateToken, checkAuth);
router.post("/register", register);
router.post("/login", login);

module.exports = router;
