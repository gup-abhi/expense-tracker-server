const asyncHandler = require("express-async-handler");

const pool = require("../config/db");

/**
 * @description Method get all the currencies
 */
const getCurrencies = asyncHandler(async (req, res) => {
  const queryString = "SELECT * FROM currencies";
  const { rows } = await pool.query(queryString);

  console.info(`rows - ${JSON.stringify(rows)}`);

  if (rows.length === 0) {
    res.status(404);
    throw new Error("No currencies found");
  } else {
    res.status(200).json(rows);
  }
});

module.exports = {
  getCurrencies,
};
