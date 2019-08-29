const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcrypt");
const Joi = require("joi");

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 40,
    unique: true
  },
  passwordHash: { type: String, required: true, minlength: 4, maxlength: 1024 },
  isStaff: Boolean
});

schema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    {
      _id: this._id,
      username: this.username,
      isStaff: this.isStaff
    },
    config.get("jwtPrivateKey")
  );
  return token;
};

schema.methods.createAndSetPasswordHash = async function(password) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
};

schema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.model("User", schema);

function validateAuthRequest(obj) {
  const schema = {
    username: Joi.string()
      .min(4)
      .max(40)
      .required(),
    password: Joi.string()
      .min(4)
      .max(40)
      .required()
  };
  return Joi.validate(obj, schema);
}

module.exports.User = User;
module.exports.validateAuthRequest = validateAuthRequest;
