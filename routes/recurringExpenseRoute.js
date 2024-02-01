const express = require("express");
const router = express.Router();

const {
  getRecurringExpense,
  setRecurringExpense,
  getRecurringExpenseById,
} = require("../controllers/recurringExpenseController");

router.route("/").get(getRecurringExpense).post(setRecurringExpense);
router.route("/id").get(getRecurringExpenseById);

module.exports = router;
