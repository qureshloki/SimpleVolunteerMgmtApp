module.exports.isBlank = function(val) {
  return val === null || val === undefined || val === "";
};

module.exports.formatDate = function(d) {
  if (!d) return;

  let month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};
