const Post = require("../models/postModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { userInfo } = require("./usersController");
const multer = require("multer");
const path = require("path");

// get config vars
dotenv.config();

// access config var
process.env.TOKEN_SECRET;

module.exports.postOne = async (req, res, next) => {
  try {
    const { id } = req.user;
    const post = req.body.post;
    const filename = req.file ? req.file.filename : null;

    const path = req.file ? req.file.path : null;
    const mimetype = req.file ? req.file.mimetype : null;

    const postOne = await Post.create({
      user: id,
      post,
      filename: filename || null,
      mimetype: mimetype || null,

      path: path || null,
    });

    const updateUser = await User.updateOne(
      { _id: req.user.id },
      { $inc: { postsCount: 1 } }
    );

    const newPost = {
      id: postOne._id,
      post: postOne.post,
      time: postOne.createdAt,
      path: postOne.path,
    };

    return res.json({ success: true, post: newPost });
  } catch (er) {
    next(er);
  }
};

module.exports.GetPosts = async (req, res, next) => {
  const perPage = req.params.perpage ? req.params.perpage : 10;
  try {
    const id = req.user;
    Post.find()
      .limit(perPage)
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        match: {},
        select: "username avatarImage",
        model: User,
      })
      .exec((err, posts) => {
        if (err) next(err);
        posts = posts.filter((post) => post.userId !== null);
        const modifiedPosts = posts.map((post) => {
          const hasImage = post.filename ? true : false;

          return {
            id: post._id,
            post: post.post,
            likes: post.likes.length,
            time: post.createdAt,
            hasImage,
            path: post.path,
            isLiked: post.likes.includes(req.user.id) ? true : false,
            user: {
              username: post.user.username,
              avatarImage: post.user.avatarImage,
            },
          };
        });
        return res.json({ success: true, posts: modifiedPosts });
      });

    // }
  } catch (ex) {
    next(ex);
  }
};

module.exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findOne(
      { _id: req.params.id },
      { likes: 1, _id: 0 }
    );
    if (post.likes.includes(req.user.id)) {
      const unlikePost = await Post.updateOne(
        { _id: req.params.id },
        { $pull: { likes: req.user.id } }
      );
      if (unlikePost) {
        return res.json({ success: true, liked: false });
      }
    } else {
      const likePost = await Post.updateOne(
        { _id: req.params.id },
        { $push: { likes: req.user.id } }
      );
      if (likePost) {
        return res.json({ success: true, liked: true });
      }
    }
  } catch (ex) {
    return false;
  }
};

// Set storage engine for multer
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Initialize multer upload object
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    checkFileType(file, callback);
  },
}).single("file");

// Check file type
function checkFileType(file, callback) {
  // Allowed file extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check file extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return callback(null, true);
  } else {
    callback("Error: Images only!");
  }
}

module.exports.uploadImage = (req, res, next) => {
  upload(req, res, function (err) {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Error: File size too large" });
      } else if (err.message) {
        return res.status(400).json({ message: err.message });
      } else {
        return res.status(400).json({ message: "Error uploading file" });
      }
    } else if (!req.file) {
      req.file = null;
    }
    next();
  });
};
