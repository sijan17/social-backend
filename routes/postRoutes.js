const { authenticateToken } = require("../controllers/authController");
const {
  likePost,
  GetPosts,
  postOne,
} = require("../controllers/postController");

const router = require("express").Router();

router.post("/", authenticateToken, postOne);
router.get("/posts", authenticateToken, GetPosts);
router.post("/like/:id", authenticateToken, likePost);
module.exports = router;
