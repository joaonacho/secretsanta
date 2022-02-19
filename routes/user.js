const router = require("express").Router();

// Require the User model in order to interact with the database
const User = require("../models/User.model");

const mongoose = require("mongoose");

// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

//GET profile page
router.get("/profile", isLoggedIn, (req, res, next) => {
  // const { id } = req.params;
  // const { username, groups, interests, profileImg } = req.body;
  // User.findById(id).then((userFound) => {
  res.render("user/profilepage", { user: req.session.user });
  // });
});

//GET Edit profile
router.get("/profile/edit/:id", (req, res, next) => {
  const { id } = req.params;
  User.findById(id).then((updateUser) => {
    //console.log(updateUser);
    res.render("user/editprofile", { user: updateUser });
  });
});

//POST Edit profile
router.post("/profile/edit/:id", (req, res, next) => {
  console.log("enter post edit");
  const { id } = req.params;

  let profileImg = req.body.profileImg;

  if (profileImg === "" || !profileImg) {
    profileImg = req.session.user.profileImg;
    console.log("req.session.user", req.session.user.profileImg);
  }
  const { username, interests } = req.body;

  User.findByIdAndUpdate(id, { username, interests, profileImg }, { new: true })
    .then((updatedUser) => {
      //console.log(updatedUser);
      res.render("user/profilepage", { user: updatedUser });
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
