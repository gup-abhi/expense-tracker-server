const asyncHandler = require("express-async-handler");

const pool = require("../config/db");

/**
 * @description Method get all the payment methods
 */
const getPaymentTypes = asyncHandler(async (req, res) => {
  const queryString = "SELECT * FROM payment_methods";
  const { rows } = await pool.query(queryString);

  console.info(`rows - ${JSON.stringify(rows)}`);

  if (rows.length === 0) {
    res.status(404);
    throw new Error("No payment methods found");
  } else {
    const response = [...rows];

    if (req.query.includeAll === "true") {
      response.push({
        id: process.env.PAYMENT_METHODS_ALL_ID,
        method: "All",
      });
    }

    res.status(200).json(response);
  }
});

module.exports = {
  getPaymentTypes,
};
