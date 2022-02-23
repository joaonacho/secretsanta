const router = require("express").Router();

// Require the User model in order to interact with the database
const User = require("../models/User.model");
const Group = require("../models/Group.model");

const mongoose = require("mongoose");

// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

//GET Create group
router.get("/creategroup", (req, res) => {
  res.render("group/creategroup");
});

//POST Create group
router.post("/creategroup", (req, res, next) => {
  const { groupName, description, price, groupImg } = req.body;
  let admin = req.session.user._id;
  let users = [req.session.user._id];

  Group.findOne({ groupName })
    .then((newGroup) => {
      if (!newGroup) {
        Group.create({
          admin,
          groupName,
          description,
          users,
          price,
          groupImg,
        })
          .then((createdGroup) => {
            return User.findByIdAndUpdate(admin, {
              $push: { groups: createdGroup._id },
            });
          })
          .then((user) => {
            res.redirect("/user/profile");
          });
      }
    })
    .catch((error) => {
      next(error);
    });
});

//GET View group
router.get("/group/:id", (req, res) => {
  const { id } = req.params;

  Group.findById(id)
    .populate("users")
    .then((group) => {
      // console.log(group);
      res.render("group/group", { group });
    });
});

//GET Edit group
router.get("/group/edit/:id", (req, res) => {
  const { id } = req.params;

  Group.findById(id)
    .populate("users")
    .then((group) => {
      // console.log(group);
      res.render("group/editgroup", { group });
    });
});

//POST Edit group
router.post("/group/edit/:id", (req, res, next) => {
  const { id } = req.params;
  const { groupName, description, users, email, price, groupImg } = req.body;

  Group.findByIdAndUpdate(
    id,
    {
      groupName,
      description,
      users,
      email,
      price,
      groupImg,
    },
    { new: true }
  )
    .then((updatedGroup) => {
      res.redirect("/user/profile");
    })
    .catch((error) => {
      next(error);
    });
});

//POST Delete group
router.post("/group/:id/delete", (req, res, next) => {
  const { id } = req.params;

  Group.findByIdAndDelete(id)
    .then(() => {
      res.redirect("user/profilepage");
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
