const express = require("express");
const router = express.Router();

const {
  getUser,
  createUser,
  getBudget,
  setBudget,
  getRemainingBudget,
  getGoal,
  setGoal,
  getSavings,
} = require("../controllers/userController");

router.route("/").get(getUser).post(createUser);
router.route("/budget").get(getBudget).post(setBudget);
router.route("/budget/remaining").get(getRemainingBudget);
router.route("/goal").get(getGoal).post(setGoal);
router.route("/savings").get(getSavings);

module.exports = router;
