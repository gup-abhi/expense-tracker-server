const express = require("express");
const router = express.Router();

const { getCurrencies } = require("../controllers/currencyController");

router.route("/").get(getCurrencies);

module.exports = router;
