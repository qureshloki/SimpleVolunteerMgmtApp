const mongoose = require("mongoose");
const Joi = require("joi");
const Opportunity = require("./opportunity");

const schema = new mongoose.Schema({
  opportunityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: Number, required: true },
  schedule: {
    type: {
      fromDate: { type: Date, required: true },
      toDate: { type: Date, required: true }
    },
    required: true
  },
  reason: { type: String, required: true },
  experience: String
});

schema.methods.emailStaff = async function() {
  if (!this.opportunityId) return;
  const opportunity = Opportunity.findById(this.opportunityId);
  const applnDetails = {
    "Opportunity Id": opportunity._id,
    "Opportunity Title": opportunity.title,
    "Application Id": this._id,
    "Candidate Name": this.name,
    "Candidate Email": this.email,
    "Candidate Mobile": this.mobile,
    "Candidate Availability": {
      "Start Date": this.fromDate,
      "End Date": this.toDate
    },
    "Reason For Volunteering": this.reason,
    "Volunteer Experience": this.experience
  };
  const emailBody = JSON.stringify(applnDetails);
  const emailTo = opportunity.email;
  console.log(`Sending email...emailTo=${emailTo}  emailBody= ${emailBody}`);
  //TODO: send email
};

const Application = mongoose.model("Application", schema);

function validateApplication(reqObj) {
  const schema = {
    opportunityId: Joi.string(),
    name: Joi.string().required(),
    email: Joi.string()
      .email()
      .required(),
    mobile: Joi.number()
      .integer()
      .min(1000000000)
      .max(9999999999),
    schedule: Joi.object({
      fromDate: Joi.date()
        .iso()
        .required(),
      toDate: Joi.date()
        .iso()
        .required()
    }).required(),
    reason: Joi.string().required(),
    experience: Joi.string()
  };
  //TODO: add business validation, e.g. if fromDate < Opportunity.fromDate etc.
  return Joi.validate(reqObj, schema);
}

module.exports.validateApplication = validateApplication;
module.exports.Application = Application;
