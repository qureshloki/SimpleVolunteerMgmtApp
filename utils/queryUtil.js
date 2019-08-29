const util = require("../utils/util");

module.exports.orAndAddConditions = function(condObj, cond1, cond2) {
  let cond;
  if (!cond1 && !cond2) return;
  if (!cond1) cond = cond2;
  else if (!cond2) cond = cond1;
  else cond = { $or: [cond1, cond2] };
  this.addCondition(condObj, cond);
};

module.exports.addCondition = function(conds, cond) {
  if (!conds || !cond) return;
  conds.push(cond);
};
module.exports.getCondition = function(field, val, op, checknull = true) {
  if (checknull && util.isBlank(val)) return null;

  switch (op) {
    case "eq":
      return { [field]: { $eq: val } };
    case "lte":
      return { [field]: { $lte: val } };
    case "gte":
      return { [field]: { $gte: val } };
    case "like":
      return { [field]: { $regex: val, $options: "i" } };
  }
  return null;
};

module.exports.getAndAddCondition = function(conds, field, val, op) {
  this.addCondition(conds, this.getCondition(field, val, op));
};
