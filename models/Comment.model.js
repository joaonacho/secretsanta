const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
  {
    content: String,
    user: String,
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Comment = model("Comment", commentSchema);

module.exports = Comment;
