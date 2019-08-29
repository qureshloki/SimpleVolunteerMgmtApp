const config = require("config");

module.exports = function(req, res, next) {
  if (!config.get("requiresAuth")) return next();

  if (!req.user || !req.user.isStaff)
    return res.status(403).send("Unauthorized access.");

  next();
};
