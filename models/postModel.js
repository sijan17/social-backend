const mongoose = require("mongoose");
const postSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  post: {
    type: String,
    required: true,
    max: 400,
  },
  time: {
    type: Date,
    required: true,
    default: new Date(),
  },
  likes: {
    type: Array,
    required: true,
    default: [],
  },
});

module.exports = mongoose.model("Post", postSchema);
