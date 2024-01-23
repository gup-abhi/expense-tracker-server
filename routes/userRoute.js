const express = require("express");
const router = express.Router();

const {
  getUser,
  createUser,
  getBudget,
} = require("../controllers/userController");

router.route("/").get(getUser).post(createUser);
router.route("/budget").get(getBudget);

module.exports = router;
