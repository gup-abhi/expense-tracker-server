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

router.route("/:id").get(getExpense).delete(deleteExpense).put(updateExpense);
router.route("/").post(createExpense);
router
  .route("/getAllExpensesForUser/:username/y/:year/m/:month/c/:category_id")
  .get(getAllExepnsesForUser);
router
  .route("/getTotalAmountForEachCategory/:username/y/:year/m/:month")
  .get(getTotalAmountForEachCategory);

module.exports = router;
