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
  .route(
    "/getAllExpensesForUser/:username/y/:year/m/:month/c/:category_id/p/:payment_method_id/t/:transaction_type_id"
  )
  .get(getAllExepnsesForUser);
router
  .route(
    "/getTotalAmountForEachCategory/:username/y/:year/m/:month/c/:category_id/p/:payment_method_id/t/:transaction_type_id"
  )
  .get(getTotalAmountForEachCategory);

module.exports = router;
