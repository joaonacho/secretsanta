const router = require("express").Router();

// Require the User model in order to interact with the database
const User = require("../models/User.model");
const Group = require("../models/Group.model");

const mongoose = require("mongoose");

// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");
const { populate } = require("../models/User.model");

//GET profile page
router.get("/profile", isLoggedIn, (req, res, next) => {
  User.find()
    .populate("groups")
    .then((usersInGroup) => {
      // console.log(usersInGroup[0].groups[0].users, req.session.user._id);
      let users = [...usersInGroup[0].groups[0].users];
      // console.log(users);

      // if (users.includes(req.session.id) === true) {
      res.render("user/profilepage", {
        user: req.session.user,
        usersInGroup: usersInGroup[0].groups,
      });
      // }
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
router.post("/profile/edit/:id", (req, res, next) => {
  const { id } = req.params;

  let profileImg = req.body.profileImg;

  if (profileImg === "" || !profileImg) {
    profileImg = req.session.user.profileImg;
  }
  const { username, interests } = req.body;

  User.findByIdAndUpdate(id, { username, interests, profileImg }, { new: true })
    .then((updatedUser) => {
      req.session.user = updatedUser;
      res.redirect("/user/profile");
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
