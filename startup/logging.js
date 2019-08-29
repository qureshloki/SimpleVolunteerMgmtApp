const winston = require("winston");

module.exports = function() {
  const logfile = "logfile.log";
  winston.add(
    new winston.transports.Console({ colorize: true, prettyPrint: true })
  );
  winston.add(new winston.transports.File({ filename: logfile }));

  //log unhandled exceptions & unhandled promise rejections, & exit process
  winston.handleExceptions(
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
    new winston.transports.File({ filename: logfile })
  );
  process.on("unhandledRejection", ex => {
    throw ex;
  });
};
