require("express-async-errors");
const error = require("../middleware/error");

module.exports = function(app) {
  app.use(error);
};
