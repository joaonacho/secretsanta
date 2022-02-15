const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    role: { type: String, enum: ["user", "admin"], default: "user" },
    username: {
      type: String,
      unique: true,
      required: [true, "My friend, we need names!"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "You need to use a valid email."],
      lowercase: true,
      trim: true,
    },
    comments: {
      type: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    },
    password: {
      type: String,
      required: [true, "You forgot the password."],
    },
    profileImg: String,
    interests: String,
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
