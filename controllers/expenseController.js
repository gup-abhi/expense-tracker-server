const asyncHandler = require("express-async-handler");

const pool = require("../config/db");

/**
 * @description Method get all the expenses for username
 * @param username username
 */
const getAllExepnsesForUser = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const queryString = `SELECT e.*, e.category_id, c.category_name 
FROM expenses e 
JOIN categories c
ON e.category_id = c.id
WHERE username = $1
ORDER BY date desc`;
  const { rows } = await pool.query(queryString, [username]);

  if (rows.length === 0) {
    res.status(404);
    throw new Error(`No expense found for ${username}`);
  } else {
    res.status(200).json(rows);
  }
});

/**
 * @description Method get an expense using id
 * @param id expense id
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
 * @param username username
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

module.exports = {
  getExpense,
  getAllExepnsesForUser,
  createExpense,
  updateExpense,
  deleteExpense,
};
