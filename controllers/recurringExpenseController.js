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

  try {
    await pool.query("BEGIN");

    const recurringExpensesQuery = `INSERT INTO recurring_expenses (
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

    const transactionsQuery = `INSERT INTO transactions (
      amount, 
      description, 
      date, 
      category_id, 
      username, 
      transaction_type_id, 
      payment_method_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;

    const recurringExpensesResult = await pool.query(recurringExpensesQuery, [
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

    const transactionsResult = await pool.query(transactionsQuery, [
      amount,
      description,
      start_date,
      category_id,
      username,
      transaction_type_id,
      payment_method_id,
    ]);

    await pool.query("COMMIT");

    res.status(201).json({
      ...recurringExpensesResult.rows[0],
      message: "Recurring expense created successfully",
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
});

/**
 * @description Method to get all recurring expense for a user
 */
const getRecurringExpense = asyncHandler(async (req, res) => {
  const { username } = req.query;

  if (!username) {
    res.status(400);
    throw new Error("Username is missing");
  }

  const queryString = `
SELECT 
  recurring_expenses.id,
  recurring_expenses.amount,
  recurring_expenses.description,
  recurring_expenses.start_date,
  recurring_expenses.frequency,
  recurring_expenses.next_due_date,
  categories.id AS category_id,
  categories.category_name,
  users.username,
  users.currency_id,
  currencies.currency_code,
  transaction_types.id AS transaction_type_id,
  transaction_types.type AS transaction_type,
  payment_methods.id AS payment_method_id,
  payment_methods.method AS payment_method
FROM 
  recurring_expenses
JOIN 
  categories ON recurring_expenses.category_id = categories.id
JOIN 
  users ON recurring_expenses.username = users.username
JOIN 
  currencies ON users.currency_id = currencies.id
JOIN 
  transaction_types ON recurring_expenses.transaction_type_id = transaction_types.id
JOIN 
  payment_methods ON recurring_expenses.payment_method_id = payment_methods.id
WHERE 
  users.username = $1;

  `;

  const { rows } = await pool.query(queryString, [username]);

  console.info(`rows - ${JSON.stringify(rows)}`);

  if (rows.length === 0) {
    throw new Error("No recurring expense found");
  } else {
    res.status(200).json(rows);
  }
});

/**
 * @description Method to get a recurring expense by id
 */
const getRecurringExpenseById = asyncHandler(async (req, res) => {
  const { id } = req.query;

  if (!id) {
    res.status(400);
    throw new Error("Id is missing");
  }

  const queryString = `SELECT * from recurring_expenses where id = $1`;

  const { rows } = await pool.query(queryString, [id]);

  console.info(`rows - ${JSON.stringify(rows)}`);

  if (rows.length === 0) {
    throw new Error(`No recurring expense found for ${id}`);
  } else {
    res.status(200).json(rows[0]);
  }
});

/**
 * @description Method to get a recurring expense by id
 */
const deleteRecurringExpense = asyncHandler(async (req, res) => {
  const { id } = req.query;

  if (!id) {
    res.status(400);
    throw new Error("Id is missing");
  }

  const queryString = `DELETE from recurring_expenses where id = $1 RETURNING *`;

  const { rows } = await pool.query(queryString, [id]);

  console.info(`rows - ${JSON.stringify(rows)}`);

  if (rows.length === 0) {
    throw new Error(`No recurring expense found for ${id}`);
  } else {
    res.status(200).json(rows[0]);
  }
});

/**
 * @description Method to update a recurring expense by id
 */
const updateRecurringExpense = asyncHandler(async (req, res) => {
  const { id } = req.query;
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

  const recurringExpensesQuery = `UPDATE recurring_expenses 
  SET 
    amount = $1, 
    description = $2, 
    start_date = $3, 
    frequency = $4, 
    next_due_date = $5, 
    category_id = $6, 
    username = $7, 
    transaction_type_id = $8, 
    payment_method_id = $9
  WHERE id = $10
  RETURNING *;
  `;

  const { rows } = await pool.query(recurringExpensesQuery, [
    amount,
    description,
    start_date,
    frequency,
    next_due_date,
    category_id,
    username,
    transaction_type_id,
    payment_method_id,
    id,
  ]);

  if (rows.length === 0) {
    throw new Error(`No recurring expense found for ${id}`);
  } else {
    res.status(200).json({
      ...rows[0],
      message: "Recurring expense updated successfully",
    });
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
  getRecurringExpenseById,
  deleteRecurringExpense,
  updateRecurringExpense,
};
