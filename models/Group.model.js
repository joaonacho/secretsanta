const { Schema, model } = require("mongoose");

const groupSchema = new Schema({
  groupname: {
    type: String,
    unique: [true, "Don't be a party crasher! Make your own group."],
  },
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  groupImg: String,
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  profilePic: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

const Group = model("Group", groupSchema);

module.exports = Group;
