const express = require("express");
const router = express.Router();

const { getPaymentTypes } = require("../controllers/paymentController");

router.route("/").get(getPaymentTypes);

module.exports = router;
