const asyncHandler = require("express-async-handler");

const pool = require("../config/db");

/**
 * @description Method get all the transaction types
 */
const getTransactionTypes = asyncHandler(async (req, res) => {
  const queryString = "SELECT * FROM transaction_types";
  const { rows } = await pool.query(queryString);

  console.info(`rows - ${JSON.stringify(rows)}`);

  if (rows.length === 0) {
    res.status(404);
    throw new Error("No transaction types found");
  } else {
    const response = [...rows];

    if (req.query.includeAll === "true") {
      response.push({
        id: process.env.TRANSACTION_TYPES_ALL_ID,
        type: "All",
      });
    }

    res.status(200).json(response);
  }
});

module.exports = {
  getTransactionTypes,
};
