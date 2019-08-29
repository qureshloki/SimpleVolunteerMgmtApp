const cors = require("cors");
const decodeAuthToken = require("../middleware/decodeAuthToken");

module.exports = function(app) {
  app.use(cors());
  app.use(decodeAuthToken);
};
