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
    groups: {
      type: [{ type: Schema.Types.ObjectId, ref: "Group" }],
    },
    password: {
      type: String,
      required: [true, "You forgot the password."],
    },
    profileImg: {
      type: String,
      default:
        "https://res.cloudinary.com/dxxmsbtrt/image/upload/v1645126731/SecretSanta/avatar-profile_ty1qpt.webp",
    },
    interests: { type: String, default: "What" },
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
