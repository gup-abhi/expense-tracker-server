const express = require("express");
const router = express.Router();

const {
  getRecurringExpense,
  setRecurringExpense,
} = require("../controllers/recurringExpenseController");

router.route("/").get(getRecurringExpense).post(setRecurringExpense);

module.exports = router;
