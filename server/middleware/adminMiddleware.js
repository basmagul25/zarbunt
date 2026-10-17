function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (req.user.isActive === false) {
    return res.status(403).json({
      message: "Your account has been deactivated.",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required.",
    });
  }

  next();
}

module.exports = adminOnly;