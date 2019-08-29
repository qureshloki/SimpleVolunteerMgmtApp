const validate = require("../middleware/validate");
const express = require("express");
const router = express.Router();
const { User, validateAuthRequest } = require("../models/user");

router.post("/", [validate(validateAuthRequest)], async (req, res) => {
  let user = await User.findOne({ username: req.body.username });
  const errorMsg = "Invalid username or password.";
  if (!user) return res.status(400).send(errorMsg);

  const validPassword = await user.comparePassword(req.body.password);
  if (!validPassword) return res.status(400).send(errorMsg);

  const token = user.generateAuthToken();
  return res.send(token);
});

module.exports = router;
