const router = require("express").Router();

// Require the User model in order to interact with the database
const User = require("../models/User.model");

const mongoose = require("mongoose");

// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/profile/:id", (req, res, next) => {
  const userId = req.body.id;

  res.render("user/profilepage");
});

module.exports = router;
