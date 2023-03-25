const { authenticateToken } = require("../controllers/authController");
const { uploadImage, searchPosts } = require("../controllers/postController");
const {
  likePost,
  GetPosts,
  postOne,
} = require("../controllers/postController");
const router = require("express").Router();

router.post("/", authenticateToken, uploadImage, postOne);
router.get("/posts", authenticateToken, GetPosts);
router.post("/like/:id", authenticateToken, likePost);
router.get("/search/:term", authenticateToken, searchPosts);
module.exports = router;
