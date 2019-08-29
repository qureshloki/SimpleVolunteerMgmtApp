const config = require("config");

module.exports = function(req, res, next) {
  if (config.get("requiresAuth") && !req.user)
    return res
      .status(401)
      .send("Access denied. Invalid token or no token provided.");

  next();
};
