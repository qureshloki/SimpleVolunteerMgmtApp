const config = require("config");
const express = require("express");
const winston = require("winston");

require("./startup/logging")(); //set up logging
require("./startup/config")(); //check config
require("./startup/db")(); // connect to db
require("./startup/validation")(); //set up validation lib

const app = express(); //set up express
require("./startup/commonMiddleware")(app);
require("./startup/routes")(app);
require("./startup/error")(app);

//start web server
const port = process.env.PORT || config.get("port");
const server = app.listen(port, () => {
  winston.info(`Listening on port ${port} ...`);
});

module.exports = server;
