const isAdmin = (req, res, next) => {
  try {
    if (req.session.user.role === "admin") {
      next();
    } else {
      return res.status(400).json({ msg: "have not been logged in yet" });
    }
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
};
module.exports = isAdmin;
