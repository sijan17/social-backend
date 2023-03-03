const Post = require("../models/postModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { userInfo } = require("./usersController");

// get config vars
dotenv.config();

// access config var
process.env.TOKEN_SECRET;

module.exports.postOne = async (req, res, next) => {
  try {
    const { id } = req.user;
    const post = req.body.post;

    const postOne = await Post.create({
      user: id,
      time: new Date(),
      post,
    });

    const newPost = {
      id: postOne._id,
      post: postOne.post,
      time: postOne.time,
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
      .sort({ time: -1 })
      .populate({
        path: "user",
        match: {},
        select: "username avatarImage",
        model: User,
      })
      .exec((err, posts) => {
        if (err) throw err;
        posts = posts.filter((post) => post.userId !== null);
        const modifiedPosts = posts.map((post) => ({
          id: post._id,
          post: post.post,
          likes: post.likes.length,
          time: post.time,
          isLiked: post.likes.includes(req.user.id) ? true : false,
          user: {
            username: post.user.username,
            avatarImage: post.user.avatarImage,
          },
        }));
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
    console.log(post.likes);
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
