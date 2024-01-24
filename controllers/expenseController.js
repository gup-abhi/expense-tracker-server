const asyncHandler = require("express-async-handler");

const pool = require("../config/db");

/**
 * @description Method get all the expenses for username
 * @param {string} username
 * @param {number} year
 * @param {number} month
 * @param {number} category_id
 * @param {number} payment_method_id
 * @param {number} transaction_type_id
 */
const getAllExepnsesForUser = asyncHandler(async (req, res) => {
  const { username } = req.query;
  const { year } = req.query;
  const { month } = req.query;
  let { category_id } = req.query;
  let { payment_method_id } = req.query;
  let { transaction_type_id } = req.query;

  category_id =
    Number(category_id) == process.env.CATEGORY_ALL_ID ? null : category_id;
  payment_method_id =
    Number(payment_method_id) == process.env.PAYMENT_METHODS_ALL_ID
      ? null
      : payment_method_id;
  transaction_type_id =
    Number(transaction_type_id) == process.env.TRANSACTION_TYPES_ALL_ID
      ? null
      : transaction_type_id;

  const queryString = `SELECT x.currency_code, t.*, c.category_name, tt.type as transaction_type, pm.method as payment_method
  from currencies x, categories c, transactions t, users u, transaction_types tt, payment_methods pm
  where 
  t.username = $1
  and 
  c.id = t.category_id
  and 
  u.currency_id = x.id
  and 
  tt.id = t.transaction_type_id
  and 
  pm.id = t.payment_method_id
  and 
  EXTRACT(YEAR FROM date) = $2
  AND 
  EXTRACT(MONTH FROM date) = $3
  AND 
  ($4::INTEGER IS NULL OR c.id = $4::INTEGER)
  AND
  ($5::INTEGER IS NULL OR pm.id = $5::INTEGER)
  AND
  ($6::INTEGER IS NULL OR tt.id = $6::INTEGER)
  order by date desc
`;
  const { rows } = await pool.query(queryString, [
    username,
    year,
    month,
    category_id,
    payment_method_id,
    transaction_type_id,
  ]);

  console.log(`rows - ${JSON.stringify(rows)}`);

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
  const { id } = req.query;
  const queryString = "SELECT * FROM transactions where id = $1";
  const { rows } = await pool.query(queryString, [id]);

  if (rows.length === 0) {
    res.status(404);
    throw new Error(`Expense doesn't exist for id ${id}`);
  } else {
    res.status(200).json(...rows);
  }
});

/**
 * @description Method to create a new expense
 * @body
 */
const createExpense = asyncHandler(async (req, res) => {
  const {
    date,
    amount,
    category_id,
    description,
    username,
    transaction_type_id,
    payment_method_id,
  } = req.body;
  if (
    !description ||
    !date ||
    !amount ||
    !category_id ||
    !transaction_type_id ||
    !payment_method_id
  ) {
    res.status(400);
    throw new Error("Please send all the details");
  }

  const queryString = `INSERT INTO transactions 
    (username, date, amount, category_id, description, transaction_type_id, payment_method_id) 
    VALUES 
    ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
  const { rows } = await pool.query(queryString, [
    username,
    date,
    amount,
    category_id,
    description,
    transaction_type_id,
    payment_method_id,
  ]);
  res.status(201).json({ message: "Expense created successfully", ...rows[0] });
});

/**
 * @description Method to update expense using id
 * @param id expense id
 */
const updateExpense = asyncHandler(async (req, res) => {
  const {
    description,
    date,
    category_id,
    amount,
    transaction_type_id,
    payment_method_id,
  } = req.body;
  const { id } = req.query;
  if (
    !description ||
    !date ||
    !category_id ||
    !amount ||
    !id ||
    !transaction_type_id ||
    !payment_method_id
  ) {
    res.status(400);
    throw new Error("Please send all the details");
  }

  const queryString = `UPDATE transactions 
  SET description = $1, date = $2, category_id = $3, amount = $4, transaction_type_id = $5, payment_method_id = $6 
  WHERE id = $7 RETURNING *`;
  const { rows } = await pool.query(queryString, [
    description,
    date,
    category_id,
    amount,
    transaction_type_id,
    payment_method_id,
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
  const { id } = req.query;

  const queryString = "DELETE FROM transactions WHERE id = $1 RETURNING *";
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
 * @param {number} category_id
 * @param {number} payment_method_id
 * @param {number} transaction_type_id
 */
const getTotalAmountForEachCategory = asyncHandler(async (req, res) => {
  const { username, year, month } = req.query;
  let { category_id } = req.query;
  let { payment_method_id } = req.query;
  let { transaction_type_id } = req.query;

  category_id =
    Number(category_id) == process.env.CATEGORY_ALL_ID ? null : category_id;
  payment_method_id =
    Number(payment_method_id) == process.env.PAYMENT_METHODS_ALL_ID
      ? null
      : payment_method_id;
  transaction_type_id =
    Number(transaction_type_id) == process.env.TRANSACTION_TYPES_ALL_ID
      ? null
      : transaction_type_id;

  const queryString = `SELECT c.category_name as label, COALESCE(TO_CHAR(SUM(t.amount), 'FM999999990.00'), '0') as value
  FROM categories c 
  LEFT JOIN transactions t ON t.category_id = c.id AND t.username = $1
  AND EXTRACT(YEAR FROM t.date) = $2
  AND EXTRACT(MONTH FROM t.date) = $3
  AND ($4::INTEGER IS NULL OR c.id = $4::INTEGER)
  AND ($5::INTEGER IS NULL OR t.payment_method_id = $5::INTEGER)
  AND ($6::INTEGER IS NULL OR t.transaction_type_id = $6::INTEGER)
  GROUP BY c.category_name;;
  `;
  const { rows } = await pool.query(queryString, [
    username,
    year,
    month,
    category_id,
    payment_method_id,
    transaction_type_id,
  ]);

  let total = 0;

  for (let i = 0; i < rows.length; i++) {
    total += Number(rows[i].value);
  }

  const rowsWithId = rows.map((row, index) => ({
    id: index,
    ...row,
    total,
  }));

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
