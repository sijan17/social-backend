const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
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
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: req.user.id },
        },
      },
      {
        $project: {
          email: 1,
          username: 1,
          avatarImage: 1,
          following: 1,
          isFollowed: {
            $in: ["$_id", followingList],
          },
          id: "$_id",
        },
      },
    ]);
    return res.json({ success: true, users: users });
  } catch (ex) {
    return res.json({ success: false });
  }
};

module.exports.userData = async (req, res, next) => {
  const username = req.params.username;
  try {
    const user = await User.findOne({ username: username });
    const userId = user._id;
    const followerCount = await User.countDocuments({ following: userId });
    const followers = await User.find({ following: userId });
    console.log(followerCount);
    const followingCount = user.following.length;
    res.json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        avatarImage: user.avatarImage,
        followingCount,
        followerCount,
        followers,
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
    console.log(userId + " " + followId);
    if (userId !== followId) {
      const user = await User.findById(userId);
      const followingIndex = user.following.indexOf(followId);

      if (followingIndex === -1) {
        user.following.push(followId);
        await user.save();
        return res.json({ success: true, followed: true });
      } else {
        user.following.splice(followingIndex, 1);
        await user.save();
        return res.json({ success: true, followed: false });
      }
    } else {
      return res.json({ success: false });
    }
  } catch (ex) {
    return res.json({ success: false });
  }
};
