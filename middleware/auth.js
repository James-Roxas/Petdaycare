function checkRole(allowedRoles) {
  return (req, res, next) => {
    const user = req.session.user; // ✅ This is where your login stored user info
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).send("Forbidden: insufficient permissions");
    }
    next();
  };
}

module.exports = { checkRole };
