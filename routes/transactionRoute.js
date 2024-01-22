const express = require("express");
const router = express.Router();

const { getTransactionTypes } = require("../controllers/transactionController");

router.route("/").get(getTransactionTypes);

module.exports = router;
