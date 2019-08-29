const auth = require("../middleware/auth");
const staff = require("../middleware/staff");
const validate = require("../middleware/validate");
const queryUtil = require("../utils/queryUtil");
const {
  addPaginationFilter,
  validateAndGetPageInfo,
  getTotalPages
} = require("../utils/paginationUtil");
const validateObjectId = require("../middleware/validateObjectId");
const {
  Opportunity,
  validateOpportunity,
  validateOpportunitySearchRequest,
  calculateAndSetTotalDurationDays
} = require("../models/opportunity");
const { Application, validateApplication } = require("../models/application");
const express = require("express");
const router = express.Router();

const errorMsgOppNotFound = "Opportunity with given ID was not found.";
router.post(
  "/",
  [auth, staff, validate(validateOpportunity)],
  async (req, res) => {
    calculateAndSetTotalDurationDays(req.body);
    const opportunity = new Opportunity(req.body);
    await opportunity.save();
    return res.send(opportunity);
  }
);

router.post("/:id/applications", [validateObjectId], async (req, res) => {
  req.body.opportunityId = req.params.id;
  validateApplication(req.body);
  const application = new Application(req.body);
  await application.save();
  await application.emailStaff();
  return res.send(application);
});

router.put(
  "/:id",
  [auth, staff, validateObjectId, validate(validateOpportunity)],
  async (req, res) => {
    calculateAndSetTotalDurationDays(req.body);
    const opportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!opportunity) return res.status(404).send(errorMsgOppNotFound);

    res.send(opportunity);
  }
);

router.delete("/:id", [auth, staff, validateObjectId], async (req, res) => {
  const opportunity = await Opportunity.findByIdAndRemove(req.params.id);
  if (!opportunity) return res.status(404).send(errorMsgOppNotFound);

  res.send(opportunity);
});

router.get("/:id", [validateObjectId], async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id).select("-__v");
  if (!opportunity) return res.status(404).send(errorMsgOppNotFound);

  res.send(opportunity);
});

router.get("/", async (req, res) => {
  //validate pagination params
  let { pgInfo, error } = validateAndGetPageInfo(req.query);
  if (error) return res.status(400).send(error.details[0].message);

  //validate search params
  const obj = buildSearchObjectFromQueryParams(req);
  ({ error } = validateOpportunitySearchRequest(req, obj));
  if (error) return res.status(400).send(error.details[0].message);

  const searchFilter = createDbSearchFilter(obj);
  console.log("searchFilter = " + JSON.stringify(searchFilter));
  let qry = Opportunity.find(searchFilter);
  qry = addPaginationFilter(qry, pgInfo);
  const opportunities = await qry.exec();
  const totalCount = await Opportunity.countDocuments(searchFilter);
  const result = {
    opportunities: opportunities || [],
    pgInfo: {
      totalPages: getTotalPages(totalCount, pgInfo.pgSize)
    }
  };
  res.send(result);
});

function buildSearchObjectFromQueryParams(req) {
  const params = req.query;
  const obj = {
    title: params.keywords,
    description: params.keywords,
    email: params.email
  };
  obj.location = {
    area: params.loc_area,
    city: params.loc_city
  };
  obj.schedule = {
    fromDate: params.sch_fromDate,
    toDate: params.sch_toDate,
    totalDurationDays: params.sch_maxDurationDays,
    minDurationDays: params.sch_maxDurationDays,
    hoursPerDay: params.sch_maxHoursPerDay
  };
  return obj;
}

function createDbSearchFilter(obj) {
  const conds = [];

  //search title/description contains keywords searched
  queryUtil.orAndAddConditions(
    conds,
    queryUtil.getCondition("title", obj.title, "like"),
    queryUtil.getCondition("description", obj.description, "like")
  );

  //email equals email searched
  queryUtil.getAndAddCondition(conds, "email", obj.email, "eq");

  // area equals area searched
  queryUtil.getAndAddCondition(conds, "location.area", obj.location.area, "eq");
  //city equals city searched
  queryUtil.getAndAddCondition(conds, "location.city", obj.location.city, "eq");

  //fromDate greater than equals fromDate searched
  queryUtil.getAndAddCondition(
    conds,
    "schedule.fromDate",
    obj.schedule.fromDate && new Date(obj.schedule.fromDate).toISOString(),
    "gte"
  );

  //toDate equals null or toDate less than equals toDate searched
  if (obj.schedule.toDate)
    queryUtil.orAndAddConditions(
      conds,
      queryUtil.getCondition("schedule.toDate", null, "eq", false),
      queryUtil.getCondition(
        "schedule.toDate",
        new Date(obj.schedule.toDate).toISOString(),
        "lte"
      )
    );

  //minDurationDays equals null or minDurationDays less than equals maxDuration searched
  if (obj.schedule.minDurationDays)
    queryUtil.orAndAddConditions(
      conds,
      queryUtil.getCondition("schedule.minDurationDays", null, "eq", false),
      queryUtil.getCondition(
        "schedule.minDurationDays",
        parseInt(obj.schedule.minDurationDays),
        "lte"
      )
    );

  //totalDurationDays equals null or totalDurationDays less than equals maxDuration searched
  if (obj.schedule.totalDurationDays)
    queryUtil.orAndAddConditions(
      conds,
      queryUtil.getCondition("schedule.totalDurationDays", null, "eq", false),
      queryUtil.getCondition(
        "schedule.totalDurationDays",
        parseInt(obj.schedule.totalDurationDays),
        "lte"
      )
    );

  //hoursPerDay less than equals maxHoursPerDay searched
  queryUtil.getAndAddCondition(
    conds,
    "schedule.hoursPerDay",
    obj.schedule.hoursPerDay && parseInt(obj.schedule.hoursPerDay),
    "lte"
  );
  return conds.length > 0 ? { $and: conds } : {};
}

module.exports = router;
