const router = require("express").Router();

// Require the User model in order to interact with the database
const User = require("../models/User.model");
const Group = require("../models/Group.model");
const Comment = require("../models/Comment.model");

//Cloudinary
const fileUploader = require("../config/cloudinary.config");

const mongoose = require("mongoose");

// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");
const isGroupAdmin = require("../middleware/isGroupAdmin");

//GET Create group
router.get("/creategroup", (req, res) => {
  res.render("group/creategroup");
});

//POST Create group
router.post(
  "/creategroup",
  fileUploader.single("groupImg"),
  (req, res, next) => {
    const { groupName, description, price, existingImage } = req.body;
    let admin = req.session.user._id;
    let users = [req.session.user._id];

    let groupImg;
    if (req.file) {
      groupImg = req.file.path;
    } else {
      groupImg = existingImage;
    }

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
              res.redirect(`/user/profile/${admin}`);
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
    .populate("comments")
    .then((group) => {
      const admin = group.admin.toString() === req.session.user._id;
      req.session.groupAdmin = group.admin.toString();

      res.render("group/group", { group, admin });
    });
});

//GET Edit group
router.get("/group/edit/:id", isGroupAdmin, (req, res) => {
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
      res.redirect(`/group/group/${id}`);
    })
    .catch((error) => {
      next(error);
    });
});

//GET add friends
router.get("/add/:groupId", isGroupAdmin, (req, res) => {
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
  const username = req.body.users;
  const email = req.body.email;
  let group;

  Group.findById(groupId).then((groupFound) => {
    group = groupFound.users;
  });

  //first try to find the user
  User.findOne({ email })
    .then((userFound) => {
      // if not found, create a new user
      if (!userFound) {
        return User.create({
          username,
          email,
          password: "misteryFriend@2022",
          groups: groupId,
        }).then(() => {
          console.log("user created");
        });
      }
      // if found and is not in the group, just update
      if (userFound && group.includes(userFound.id) === false) {
        return User.findOneAndUpdate(
          { email },
          { $push: { groups: groupId } },
          { new: true }
        ).then(() => {
          console.log("user updated", group);
        });
      }
    })
    .finally(() => {
      //after creating or update the user, catch his ID
      User.findOne({ email }).then((user) => {
        //Search for the group and push the user ID to the users Array
        //if the user is not in the group
        if (group.includes(user.id) === false) {
          return Group.findByIdAndUpdate(
            groupId,
            { $push: { users: user.id } },
            { new: true }
          ).then(() => {
            res.redirect(`/group/add/${groupId}`);
          });
        }

        return res.redirect(`/group/add/${groupId}`);
      });
    })
    .catch((error) => {
      next(error);
    });
});

//GET delete group
router.get("/group/delete/:id", isGroupAdmin, (req, res) => {
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
      res.redirect(`/user/profile/${req.session.user._id}`);
    })
    .catch((error) => {
      next(error);
    });
});

//Get Shuffle group
router.get("/shuffle/:groupId", isGroupAdmin, (req, res) => {
  const { groupId } = req.params;

  Group.findById(groupId)
    .populate("users")
    .then((groupShuffle) => {
      res.render("group/shufflegroup", { groupShuffle });
    });
});

//POST Shuffle group
router.post("/shuffle/:groupId", (req, res, next) => {
  const { groupId } = req.params;

  Group.findById(groupId)
    .populate("users")
    .then((groupUsers) => {
      const users = groupUsers.users;
      let userId = [];

      users.forEach((user) => {
        return userId.push(user._id);
      });

      //Shuffle the array
      let randomPos;
      let temp;

      for (let i = userId.length - 1; i > 0; i--) {
        randomPos = Math.floor(Math.random() * (i + 1));
        temp = userId[i];
        userId[i] = userId[randomPos];
        userId[randomPos] = temp;
      }

      //Make the pairs
      let idPairs = [];
      for (let i = 0; i < userId.length; i++) {
        if (i === userId.length - 1) {
          idPairs.push([userId[i], userId[0]]);
        } else {
          idPairs.push([userId[i], userId[i + 1]]);
        }
      }

      return idPairs;
    })
    //Updating group pairs (works)
    .then((idPairs) => {
      Group.findByIdAndUpdate(
        groupId,
        { $push: { pairs: idPairs }, shuffled: "" },
        { new: true }
      ).then(() => {
        res.redirect(`/group/group/${groupId}`);
      });
    });
});

//POST Comments
router.post("/comment/:groupId", (req, res, next) => {
  const { groupId } = req.params;
  const { content } = req.body;
  let user = req.session.user.username;

  Comment.create({ content, user }).then((comment) => {
    let newComment = [comment];
    Group.findByIdAndUpdate(
      groupId,
      { $push: { comments: newComment } },
      { new: true }
    ).then(() => {
      res.redirect(`/group/group/${groupId}`);
    });
  });
});

module.exports = router;
