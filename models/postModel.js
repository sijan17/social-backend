const mongoose = require("mongoose");
const postSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    post: {
      type: String,
      required: true,
      max: 400,
    },
    filename: {
      type: String,
      required: false,
    },
    mimetype: {
      type: String,
      required: false,
    },
    path: {
      type: String,
      required: false,
    },
    likes: {
      type: Array,
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", postSchema);
