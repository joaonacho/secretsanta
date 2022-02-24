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

//GET Create group
router.get("/creategroup", (req, res) => {
  res.render("group/creategroup");
});

//POST Create group
router.post(
  "/creategroup",
  fileUploader.single("groupImg"),
  (req, res, next) => {
    const { groupName, description, price } = req.body;
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
            groupImg: req.file.path,
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
  }
);

//GET View group
router.get("/group/:id", (req, res) => {
  const { id } = req.params;

  Group.findById(id)
    .populate("users")
    .then((group) => {
      res.render("group/group", { group });
    });
});

//GET Edit group
router.get("/group/edit/:id", (req, res) => {
  const { id } = req.params;

  Group.findById(id)
    .populate("users")
    .then((group) => {
      res.render("group/editgroup", { group });
    });
});

//POST Edit group
router.post("/edit/:id", fileUploader.single("groupImg"), (req, res, next) => {
  const { id } = req.params;

  console.log(req.body);
  const { groupName, description, price, existingImage } = req.body;

  let groupImg;
  if (req.file) {
    groupImg = req.file.path;
  } else {
    groupImg = existingImage;
  }

  Group.findByIdAndUpdate(
    id,
    {
      groupName,
      description,
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

//GET add friends
router.get("/add/:groupId", (req, res) => {
  const { groupId } = req.params;

  Group.findById(groupId)
    .populate("users")
    .then((group) => {
      res.render("group/addfriends", { group });
    });
});

//POST add friends
router.post("/add/:groupId", (req, res, next) => {
  const { groupId } = req.params;
  const { username } = req.body.users;
  const { email } = req.body.email;

  // console.log(req.body);

  // User.findOne(email)
  //   .then((userFound) => {
  //     if (!userFound) {
  //       return User.create({ username, email });
  //     }
  //   })
  // .then((newFriends) => {
  //   console.log(newFriends);
  Group.findByIdAndUpdate(
    groupId,
    { $push: { users: username } },
    { new: true }
  )
    .then((friendsAdded) => {
      res.redirect("/user/profile");
    })
    // })
    .catch((error) => next(error));
});

//Working properly
//GET delete group
router.get("/group/delete/:id", (req, res) => {
  const { id } = req.params;

  Group.findById(id).then((groupDelete) => {
    res.render("group/deletegroup", { groupDelete });
  });
});

// POST Delete group
router.post("/group/delete/:id", (req, res, next) => {
  const { id } = req.params;

  Group.findByIdAndDelete(id)
    .then(() => {
      res.redirect("/user/profile");
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
