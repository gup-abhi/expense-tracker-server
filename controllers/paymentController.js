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
    res.status(200).json([
      ...rows,
      //   {
      //     id: 12,
      //     category_name: "All",
      //   },
    ]);
  }
});

module.exports = {
  getPaymentTypes,
};
