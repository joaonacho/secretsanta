const { Schema, model } = require("mongoose");

const groupSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: "User" },
  groupName: {
    type: String,
    unique: [true, "Don't be a party crasher! Make your own group."],
  },
  description: String,
  price: {
    type: Number,
    min: 0,
  },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  groupImg: {
    type: String,
    default: "/images/group-avatar.jpg",
  },
  pairs: [{ type: Schema.Types.ObjectId, ref: "User" }],
  //Bonus
  mySecretSanta: { type: Schema.Types.ObjectId, ref: "User" },
});

const Group = model("Group", groupSchema);

module.exports = Group;
