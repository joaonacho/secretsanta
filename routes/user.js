const router = require("express").Router();

// Require the User model in order to interact with the database
const User = require("../models/User.model");
const Group = require("../models/Group.model");

//Cloudinary
const fileUploader = require("../config/cloudinary.config");

const mongoose = require("mongoose");

// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");
const { populate } = require("../models/User.model");

//GET profile page
router.get("/profile/:userId", isLoggedIn, (req, res, next) => {
  const { userId } = req.params;

  User.findById(userId)
    .populate("groups")
    .then((usersInGroup) => {
      if (!usersInGroup) {
        res.render("user/profilepage", {
          user: req.session.user,
        });
      } else {
        res.render("user/profilepage", {
          user: req.session.user,
          usersInGroup: usersInGroup.groups,
        });
      }
    });
});

//GET Edit profile
router.get("/profile/edit/:id", (req, res, next) => {
  const { id } = req.params;
  User.findById(id).then((updateUser) => {
    res.render("user/editprofile", { user: updateUser });
  });
});

//POST Edit profile
router.post(
  "/profile/edit/:id",
  fileUploader.single("profileImg"),
  (req, res, next) => {
    const { id } = req.params;

    const { username, interests, existingImage } = req.body;

    let profileImg;
    if (req.file) {
      profileImg = req.file.path;
    } else {
      profileImg = existingImage;
    }

    User.findByIdAndUpdate(
      id,
      { username, interests, profileImg },
      { new: true }
    )
      .then((updatedUser) => {
        req.session.user = updatedUser;
        res.redirect(`/user/profile/${id}`);
      })
      .catch((error) => {
        next(error);
      });
  }
);

module.exports = router;
