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
  const { groupName, description, price, users, groupImg } = req.body;
});

//GET View group
router.get("/group", (req, res) => {
  res.render("group/group");
});

//GET Edit group
router.get("/editgroup", (req, res) => {
  res.render("group/editgroup");
});

module.exports = router;
