const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
  {
    comments: [String],
    content: String,
    username: [{ type: Schema.Types.ObjectId, ref: "User" }],
    profilePic: [{ type: Schema.Types.ObjectId, ref: "User" }],
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
