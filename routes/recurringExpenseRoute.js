const express = require("express");
const router = express.Router();

const {
  getRecurringExpense,
  setRecurringExpense,
  getRecurringExpenseById,
  deleteRecurringExpense,
  updateRecurringExpense,
} = require("../controllers/recurringExpenseController");

router.route("/").get(getRecurringExpense).post(setRecurringExpense);
router
  .route("/id")
  .get(getRecurringExpenseById)
  .delete(deleteRecurringExpense)
  .put(updateRecurringExpense);

module.exports = router;
