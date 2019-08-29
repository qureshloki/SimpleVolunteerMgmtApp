const mongoose = require("mongoose");
const Joi = require("joi");
const _ = require("lodash");
const util = require("../utils/util");

const locationSchema = new mongoose.Schema({
  street: { type: String, required: true },
  area: { type: String, required: true },
  city: { type: String, required: true },
  zip: { type: Number, required: true }
});

const scheduleSchema = new mongoose.Schema({
  fromDate: { type: Date, get: util.formatDate, required: true },
  toDate: { type: Date, get: util.formatDate },
  minDurationDays: { type: Number, min: 1 },
  totalDurationDays: { type: Number, min: 1 },
  days: { type: [String], required: true },
  hoursPerDay: { type: Number, required: true, min: 1, max: 8 }
});

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  email: { type: String, required: true },
  location: {
    type: locationSchema,
    required: true
  },
  schedule: {
    type: scheduleSchema,
    required: true
  }
});

const Opportunity = mongoose.model("Opportunity", schema);

function calculateAndSetTotalDurationDays(reqObj) {
  if (reqObj.schedule.toDate == null) return;
  const toDate = new Date(reqObj.schedule.toDate);
  const fromDate = new Date(reqObj.schedule.fromDate);
  let timeDiffMillis = Math.abs(toDate.getTime() - fromDate.getTime());
  reqObj.schedule.totalDurationDays = Math.ceil(
    timeDiffMillis / (1000 * 3600 * 24)
  );
}

function validateOpportunity(reqObj) {
  const locationSchema = Joi.object({
    street: Joi.string().required(),
    area: Joi.string().required(),
    city: Joi.string().required(),
    zip: Joi.number()
      .min(100000)
      .max(999999)
      .required()
  });

  const scheduleSchema = Joi.object({
    fromDate: Joi.date()
      .iso()
      .required(),
    toDate: Joi.date().iso(),
    minDurationDays: Joi.number()
      .integer()
      .min(1),
    days: Joi.array()
      .min(1)
      .unique()
      .required()
      .items(Joi.string().valid("mo", "tu", "we", "th", "fr", "sa", "su")),
    hoursPerDay: Joi.number()
      .integer()
      .min(1)
      .max(8)
      .required()
  });

  const schema = {
    _id: Joi.string(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    email: Joi.string()
      .email()
      .required(),
    location: locationSchema.required(),
    schedule: scheduleSchema.required()
  };

  return Joi.validate(reqObj, schema);
}

function validateOpportunitySearchRequest(req, obj) {
  const schema = {
    title: Joi.string(),
    description: Joi.string(),
    email: Joi.string(),
    location: {
      area: Joi.string(),
      city: Joi.string()
    },
    schedule: {
      fromDate: Joi.date().iso(),
      toDate: Joi.date().iso(),
      totalDurationDays: Joi.number()
        .integer()
        .positive(),
      minDurationDays: Joi.number()
        .integer()
        .positive(),
      hoursPerDay: Joi.number()
        .integer()
        .positive()
    }
  };
  const protectedFields = ["email"];
  let inAccessibleFlds = [];
  if (!req.user || !req.user.isStaff) {
    inAccessibleFlds = _.filter(
      protectedFields,
      fldpath => _.get(obj, fldpath) !== undefined
    );
  }

  let error = null;
  if (inAccessibleFlds.length > 0) {
    error = {
      details: [
        {
          message: `Access denied. Fields not searchable ${JSON.stringify(
            inAccessibleFlds
          )}`
        }
      ]
    };
  }
  return (error && { error }) || Joi.validate(obj, schema);
}

module.exports.Opportunity = Opportunity;
module.exports.validateOpportunity = validateOpportunity;
module.exports.validateOpportunitySearchRequest = validateOpportunitySearchRequest;
module.exports.calculateAndSetTotalDurationDays = calculateAndSetTotalDurationDays;
