const express = require("express");
const auth = require("../routes/auth");
const opportunities = require("../routes/opportunities");

module.exports = function(app) {
  app.use(express.json());
  app.use("/api/auth", auth);
  app.use("/api/opportunities", opportunities);
};
