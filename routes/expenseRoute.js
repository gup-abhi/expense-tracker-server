const express = require("express");
const router = express.Router();

const {
  getExpense,
  deleteExpense,
  updateExpense,
  createExpense,
  getAllExepnsesForUser,
  getTotalAmountForEachCategory,
} = require("../controllers/expenseController");

router
  .route("/")
  .get(getExpense)
  .delete(deleteExpense)
  .put(updateExpense)
  .post(createExpense);

router.route("/getAllExpensesForUser").get(getAllExepnsesForUser);

router
  .route("/getTotalAmountForEachCategory")
  .get(getTotalAmountForEachCategory);

module.exports = router;
