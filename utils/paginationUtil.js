const Joi = require("joi");
const _ = require("lodash");

module.exports.addPaginationFilter = function(qryObj, pgInfo) {
  if (!pgInfo) return;
  const { pg, pgSize, sortBy, sortOrd } = pgInfo;
  if (sortBy) {
    qryObj = qryObj.sort({ [sortBy]: sortOrd });
  }
  qryObj = qryObj.skip((pg - 1) * pgSize).limit(pgSize);
  return qryObj;
};

module.exports.validateAndGetPageInfo = function(params) {
  const pgInfo = {
    pg: 1,
    pgSize: 10,
    sortOrd: 1
  };

  if (!params) return pgInfo;
  const schema = {
    pg: Joi.number()
      .integer()
      .positive(),
    pgSize: Joi.number()
      .integer()
      .positive(),
    sortBy: Joi.string(),
    sortOrd: Joi.any().only(1, -1, "1", "-1")
  };
  const { error } = Joi.validate(_.pick(params, Object.keys(schema)), schema);
  if (error) return { error };

  const { pg, pgSize, sortOrd, sortBy } = params;
  if (pg !== undefined) pgInfo.pg = parseInt(pg);
  if (pgSize !== undefined) pgInfo.pgSize = parseInt(pgSize);
  if (sortOrd == -1) pgInfo.sortOrd = -1;
  if (sortBy !== undefined) pgInfo.sortBy = sortBy;
  return { pgInfo };
};

module.exports.getTotalPages = function(totalCount, pgSize) {
  if (!pgSize) {
    pgSize = 10;
  }
  return Math.ceil(totalCount / pgSize);
};
