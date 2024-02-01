const asyncHandler = require("express-async-handler");
const { getNextDueDate } = require("../utils/dateGenerator");
const pool = require("../config/db");

/**
 * @description Method to create a new recurring expense
 */
const setRecurringExpense = asyncHandler(async (req, res) => {
  const {
    amount,
    description,
    start_date,
    frequency,
    category_id,
    username,
    transaction_type_id,
    payment_method_id,
  } = req.body;

  const next_due_date = getNextDueDate(start_date, frequency);

  const queryString = `INSERT INTO recurring_expenses (
    amount, 
    description, 
    start_date, 
    frequency, 
    next_due_date, 
    category_id, 
    username, 
    transaction_type_id, 
    payment_method_id) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;

  const { rows } = await pool.query(queryString, [
    amount,
    description,
    start_date,
    frequency,
    next_due_date,
    category_id,
    username,
    transaction_type_id,
    payment_method_id,
  ]);

  console.info(`rows - ${JSON.stringify(rows)}`);

  res
    .status(201)
    .json({ ...rows[0], message: "Recurring expense created successfully" });
});

/**
 * @description Method to create a new recurring expense
 */
const getRecurringExpense = asyncHandler(async (req, res) => {
  const { username } = req.query;

  if (!username) {
    res.status(400);
    throw new Error("Username is missing");
  }

  const queryString = `SELECT * from recurring_expenses where username = $1`;

  const { rows } = await pool.query(queryString, [username]);

  console.info(`rows - ${JSON.stringify(rows)}`);

  if (rows.length === 0) {
    throw new Error("No recurring expense found");
  } else {
    res.status(200).json(rows);
  }
});

/**
 * @description The method is used to get all the recurring expenses that are due for a particular date
 * @param date
 */
const getRecurringExpensesDueToday = async (date) => {
  const queryString =
    "SELECT * from recurring_expenses where next_due_date = $1";

  const { rows } = await pool.query(queryString, [date]);

  console.log(`rows - ${JSON.stringify(rows)}`);

  return rows;
};

/**
 * @description Method to update recurring expense next_due_date
 * @param {*} id
 * @param {*} next_due_date
 */
const updateRecurringExpenseNextDueDate = async (id, next_due_date) => {
  const queryString =
    "UPDATE recurring_expenses SET next_due_date = $1 where id = $2 RETURNING *";

  const { rows } = await pool.query(queryString, [next_due_date, id]);

  console.log(`rows - ${JSON.stringify(rows)}`);
};

module.exports = {
  setRecurringExpense,
  getRecurringExpense,
  getRecurringExpensesDueToday,
  updateRecurringExpenseNextDueDate,
};
