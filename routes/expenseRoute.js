const express = require("express");
const router = express.Router();

const {
  getExpense,
  deleteExpense,
  updateExpense,
  createExpense,
  getAllExepnsesForUser,
} = require("../controllers/expenseController");

router.route("/:id").get(getExpense).delete(deleteExpense).put(updateExpense);
router.route("/").post(createExpense);
router.route("/getAllExpensesForUser/:username").get(getAllExepnsesForUser);

module.exports = router;
