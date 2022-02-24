// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv/config");

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

const projectName = "secretsanta";
const capitalized = (string) =>
  string[0].toUpperCase() + string.slice(1).toLowerCase();

app.locals.title = `${capitalized(projectName)} created with IronLauncher`;

app.use((req, res, next) => {
  res.locals.userIsConnected = req.session.user ? true : false;
  if (res.locals.userIsConnected) {
    res.locals.username = req.session.user.username;
    res.locals.profileImg = req.session.user.profileImg;
  }
  next();
});

// 👇 Start handling routes here
const index = require("./routes/index");
app.use("/", index);

//authentication routes here
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

//group routes here
const groupRoutes = require("./routes/group");
app.use("/group", groupRoutes);

//user routes here
const userRoutes = require("./routes/user");
app.use("/user", userRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
