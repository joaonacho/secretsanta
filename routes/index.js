const router = require("express").Router();

// const mongoose = require("mongoose");

// const User = require("../models/User.model");

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

// router.get("/:id", (req, res, next) => {
//   const {id} = req.params.
//   res.render("index");
// });

module.exports = router;
