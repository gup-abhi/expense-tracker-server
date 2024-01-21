const asyncHandler = require("express-async-handler");

const pool = require("../config/db");

/**
 * @description Method get all the expenses for username
 * @param {string} username
 * @param {number} year
 * @param {number} month
 */
const getAllExepnsesForUser = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { year } = req.params;
  const { month } = req.params;
  let { category_id } = req.params;
  category_id = Number(category_id) == 12 ? null : category_id;
  const queryString = `SELECT x.currency_code, e.*, c.category_name
  from currencies x, categories c, expenses e, users u
  where 
  e.username = $1
  and 
  c.id = e.category_id
  and 
  u.currency_id = x.id
  and 
  EXTRACT(YEAR FROM date) = $2
  AND 
  EXTRACT(MONTH FROM date) = $3
  AND 
  ($4::INTEGER IS NULL OR c.id = $4::INTEGER)
  order by date desc`;
  const { rows } = await pool.query(queryString, [
    username,
    year,
    month,
    category_id,
  ]);

  if (rows.length === 0) {
    res.status(404);
    throw new Error(`No expense found for ${username} for ${year}-${month}`);
  } else {
    res.status(200).json(rows);
  }
});

/**
 * @description Method get an expense using id
 * @param {number} id expense id
 */
const getExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const queryString = "SELECT * FROM expenses where id = $1";
  const { rows } = await pool.query(queryString, [id]);

  if (rows.length === 0) {
    res.status(404);
    throw new Error(`Expense doesn't exist for id ${id}`);
  } else {
    res.status(200).json(rows);
  }
});

/**
 * @description Method to create a new expense
 * @param {string} username
 * @body
 */
const createExpense = asyncHandler(async (req, res) => {
  const { date, amount, category_id, expense, username } = req.body;
  if (!expense || !date || !amount || !category_id) {
    res.status(400);
    throw new Error("Please send all the details");
  }

  const queryString =
    "INSERT INTO expenses (username, date, amount, category_id, expense) VALUES ($1, $2, $3, $4, $5) RETURNING *";
  const { rows } = await pool.query(queryString, [
    username,
    date,
    amount,
    category_id,
    expense,
  ]);
  res.status(201).json({ message: "Expense created successfully", ...rows[0] });
});

/**
 * @description Method to update expense using id
 * @param id expense id
 */
const updateExpense = asyncHandler(async (req, res) => {
  const { expense, date, category_id, amount } = req.body;
  const { id } = req.params;
  if (!expense || !date || !category_id || !amount || !id) {
    res.status(400);
    throw new Error("Please send all the details");
  }

  const queryString =
    "UPDATE expenses SET expense = $1, date = $2, category_id = $3, amount = $4 WHERE id = $5 RETURNING *";
  const { rows } = await pool.query(queryString, [
    expense,
    date,
    category_id,
    amount,
    id,
  ]);
  console.info(`rows - ${JSON.stringify(rows)}`);

  if (rows.length === 0) {
    res.status(400);
    throw new Error(`Exepense doesn't exists for id - ${id}`);
  } else {
    res
      .status(200)
      .json({ message: "Expense updated successfully", ...rows[0] });
  }
});

/**
 * @description Method to delete an expense using expense id
 * @param id expense id
 */
const deleteExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const queryString = "DELETE FROM expenses WHERE id = $1 RETURNING *";
  const { rows } = await pool.query(queryString, [id]);

  if (rows.length === 0) {
    res.status(404);
    throw new Error(`Exepense doesn't exist for id - ${id}`);
  } else {
    res
      .status(200)
      .json({ message: "Exepense deleted Successfully!!", ...rows[0] });
  }
});

/**
 * @description Method to get total amount for each category for the user for a particular month
 * @param {string} username
 * @param {number} year
 * @param {number} month
 */
const getTotalAmountForEachCategory = asyncHandler(async (req, res) => {
  const { username, year, month } = req.params;
  let { category_id } = req.params;
  category_id = Number(category_id) == 12 ? null : category_id;

  const queryString = `SELECT c.category_name as label, COALESCE(TO_CHAR(SUM(e.amount), 'FM999999990.00'), '0') as value
  FROM categories c 
  LEFT JOIN expenses e ON e.category_id = c.id AND e.username = $1
  AND EXTRACT(YEAR FROM e.date) = $2
  AND EXTRACT(MONTH FROM e.date) = $3
  AND ($4::INTEGER IS NULL OR c.id = $4::INTEGER)
  GROUP BY c.category_name;
  `;
  const { rows } = await pool.query(queryString, [
    username,
    year,
    month,
    category_id,
  ]);
  let total = 0;
  const rowsWithId = rows.map((row, index) => ({
    id: index,
    ...row,
  }));

  for (let i = 0; i < rows.length; i++) {
    total += Number(rows[i].value);
  }

  console.log(`rows - ${JSON.stringify(rowsWithId)}`);

  if (total !== 0) {
    res.status(200).json(rowsWithId);
  } else {
    res.status(404).json({ message: `No Data found for ${year}-${month}` });
  }
});

module.exports = {
  getExpense,
  getAllExepnsesForUser,
  createExpense,
  updateExpense,
  deleteExpense,
  getTotalAmountForEachCategory,
};
