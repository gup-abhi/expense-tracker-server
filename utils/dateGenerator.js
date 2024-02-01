const dayjs = require("dayjs");
const isLeapYear = require("dayjs/plugin/isLeapYear"); // load isLeapYear plugin
dayjs.extend(isLeapYear); // use isLeapYear plugin

function getNextDueDate(due_date, frequency) {
  let next_due_date;

  switch (frequency) {
    case "M": // Monthly
      next_due_date = dayjs(due_date).add(1, "month");
      break;
    case "W": // Weekly
      next_due_date = dayjs(due_date).add(1, "week");
      break;
    case "Y": // Yearly
      next_due_date = dayjs(due_date).add(1, "year");
      break;
    default:
      throw new Error(`Invalid frequency: ${frequency}`);
  }

  return next_due_date.format();
}

module.exports = { getNextDueDate };
