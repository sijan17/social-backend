const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// get config vars
dotenv.config();

// access config var
process.env.TOKEN_SECRET;

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ status: false, msg: "Username already used." });

    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ status: false, msg: "Email already used." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const userInfo = {
      id: user._id,
    };

    const token = jwt.sign(userInfo, process.env.TOKEN_SECRET);
    return res.json({ status: true, user: token });
  } catch (er) {
    next(er);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user)
      return res.json({
        status: false,
        msg: "Incorrect username or password.",
      });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({
        status: false,
        msg: "Incorrect username or password.",
      });

    delete user.password;

    const userInfo = {
      id: user._id,
      username: user.username,
      email: user.email,
      avatarImage: user.avatarImage,
    };

    const token = jwt.sign(userInfo, process.env.TOKEN_SECRET);
    return res.json({ status: true, user: token });
  } catch (er) {
    next(er);
  }
};

module.exports.checkAuth = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (user) {
      return res.json({
        session: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatarImage: user.avatarImage,
        },
      });
    } else {
      return res.json({ session: false });
    }
  } catch (err) {
    return res.json({ success: false });
  }
};

module.exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == undefined) return res.json({ session: false });
  jwt.verify(token.slice(1, -1), process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.json({ session: false });
    req.user = user;
    next();
  });
};
