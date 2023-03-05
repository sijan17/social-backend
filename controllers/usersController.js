const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Post = require("../models/postModel");
dotenv.config();

process.env.TOKEN_SECRET;

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(userId, {
      isAvatarImageSet: true,
      avatarImage,
    });
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getUsers = async (req, res, next) => {
  try {
    const curUser = await User.findById(req.user.id);
    const followingList = curUser.following;
    const users = await User.find(
      { _id: { $ne: curUser } },
      { username: 1, avatarImage: 1 }
    );

    const newUsers = users.map((user) => {
      // if (!followingList.includes(user._id)) {
      return {
        id: user._id,
        username: user.username,
        avatarImage: user.avatarImage,
        isFollowed: followingList.includes(user._id) ? true : false,
      };
      // }
    });

    return res.json({ success: true, users: newUsers });
  } catch (ex) {
    next(ex);
  }
};

module.exports.userData = async (req, res, next) => {
  const username = req.params.username;
  try {
    const user = await User.findOne({ username: username });
    const userId = user._id;
    const followerCount = user.followers.length;
    const posts = await Post.find({ user: userId });
    const modifiedPosts = posts.map((post) => ({
      id: post._id,
      post: post.post,
      likes: post.likes.length,
      time: post.time,
      isLiked: post.likes.includes(req.user.id) ? true : false,
    }));
    const followingCount = user.following.length;
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarImage: user.avatarImage,
        followingCount,
        following: user.following,
        followerCount,
        followers: user.followers,
        postsCount: user.postsCount,
        location: user.location,
        joinedAt: user.joinedAt,
        isFollowing: user.followers.includes(req.user.id) ? true : false,
        posts: [...modifiedPosts],
      },
    });
  } catch (err) {
    return res.json({ success: false });
  }
};

module.exports.follow = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const followId = req.params.id;
    if (userId !== followId) {
      const user = await User.findById(userId);
      const followUser = await User.findById(followId);
      const followingIndex = user.following.indexOf(followId);

      if (followingIndex === -1) {
        user.following.push(followId);
        followUser.followers.push(userId);
        await user.save();
        await followUser.save();
        return res.json({ success: true, followed: true });
      } else {
        user.following.pull(followId);
        followUser.followers.pull(userId);
        await user.save();
        await followUser.save();
        return res.json({ success: true, followed: false });
      }
    } else {
      return res.json({ success: false });
    }
  } catch (ex) {
    next(ex);
  }
};
