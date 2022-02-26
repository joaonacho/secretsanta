module.exports = (req, res, next) => {
  if (req.session.user._id !== req.session.groupAdmin) {
    return res.redirect("/");
  }
  next();
};
