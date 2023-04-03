const mongoose = require("mongoose");
const textSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      default: 1,
    },
    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Text", textSchema);
