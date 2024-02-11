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
  verifyUser,
} = require("../controllers/userController");

router.route("/").get(getUser).post(createUser);
router.route("/budget").get(getBudget).put(setBudget);
router.route("/budget/remaining").get(getRemainingBudget);
router.route("/goal").get(getGoal).put(setGoal);
router.route("/savings").get(getSavings);
router.route("/verify/:hash").get(verifyUser);

module.exports = router;
