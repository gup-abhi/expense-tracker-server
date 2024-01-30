const asyncHandler = require("express-async-handler");

const pool = require("../config/db");

/**
 * @description Method to get the user
 */
const getUser = asyncHandler(async (req, res) => {
  const { username, password } = req.query;
  console.info(`username - ${username} :: password - ${password}`);

  if (!username || !password) {
    res.status(400);
    throw new Error("Username or password is missing");
  }

  const queryString =
    "SELECT username FROM users where username = $1 and password = $2";
  const { rows } = await pool.query(queryString, [username, password]);

  console.info(`rows - ${JSON.stringify(rows)}`);

  if (rows.length === 0) {
    res.status(404);
    throw new Error("username or password is invalid");
  } else {
    res
      .status(200)
      .json({ message: "User successfully logged in", ...rows[0] });
  }
});

/**
 * @description Method to create a new user
 */
const createUser = asyncHandler(async (req, res) => {
  const { username, password, email, currency_id, budget } = req.body;
  if (!username || !password || !email || !currency_id) {
    res.status(400);
    throw new Error("Please add all the details");
  }

  const queryString =
    "INSERT INTO users (username, password, email, currency_id, budget) VALUES ($1, $2, $3, $4, $5) RETURNING *";
  const { rows } = await pool.query(queryString, [
    username,
    password,
    email,
    currency_id,
    budget,
  ]);
  res.status(201).json(rows);
});

/**
 * @description Method to get the budget
 */
const getBudget = asyncHandler(async (req, res) => {
  const { username } = req.query;
  console.info(`username - ${username}`);

  if (!username) {
    res.status(400);
    throw new Error("Username is missing");
  }

  const queryString = "SELECT budget FROM users where username = $1";
  const { rows } = await pool.query(queryString, [username]);

  console.info(`rows - ${JSON.stringify(rows)}`);

  if (rows.length === 0) {
    res.status(404);
    throw new Error("username is invalid");
  } else {
    res.status(200).json(rows[0]);
  }
});

/**
 * @description Method to set the budget
 */
const setBudget = asyncHandler(async (req, res) => {
  const { username, budget } = req.query;
  console.info(`username - ${username}`);

  if (!username || !budget) {
    res.status(400);
    throw new Error("Username or budget is missing");
  }

  const queryString =
    "UPDATE users set budget = $1 where username = $2 RETURNING *";
  const { rows } = await pool.query(queryString, [budget, username]);

  console.info(`rows - ${JSON.stringify(rows)}`);

  if (rows.length === 0) {
    res.status(404);
    throw new Error("username is invalid");
  } else {
    res.status(200).json({
      ...rows[0],
      message: "Budget updated successfully",
    });
  }
});

/**
 * @description Method to get the remaining budget
 */
const getRemainingBudget = asyncHandler(async (req, res) => {
  const { username, year, month } = req.query;
  console.info(`username - ${username} :: month - ${month} :: year - ${year}`);

  if (!username || !year || !month) {
    res.status(400);
    throw new Error("Username, year or month is missing");
  }

  const queryString = `SELECT u.username, EXTRACT(YEAR FROM t.date) as year, EXTRACT(MONTH FROM t.date) as month, u.budget - COALESCE(sum(t.amount), 0) as remaining_budget
  FROM users as u
  LEFT JOIN transactions as t ON u.username = t.username
  LEFT JOIN transaction_types as tt ON t.transaction_type_id = tt.id
  WHERE tt.id = 2
  AND u.username = $1
  AND EXTRACT(YEAR FROM t.date) = $2
  AND EXTRACT(MONTH FROM t.date) = $3
  GROUP BY u.username, year, month;
   
  `;
  const { rows } = await pool.query(queryString, [username, year, month]);

  console.info(`rows - ${JSON.stringify(rows)}`);

  if (rows.length === 0) {
    res.status(404);
    throw new Error("username is invalid");
  } else {
    res.status(200).json(rows[0]);
  }
});

/**
 * @description Method to get the budget
 */
const getGoal = asyncHandler(async (req, res) => {
  const { username } = req.query;
  console.info(`username - ${username}`);

  if (!username) {
    res.status(400);
    throw new Error("Username is missing");
  }

  const queryString = "SELECT goal FROM users where username = $1";
  const { rows } = await pool.query(queryString, [username]);

  console.info(`rows - ${JSON.stringify(rows)}`);

  if (rows.length === 0) {
    res.status(404);
    throw new Error("username is invalid");
  } else {
    res.status(200).json(rows[0]);
  }
});

/**
 * @description Method to set the budget
 */
const setGoal = asyncHandler(async (req, res) => {
  const { username, goal } = req.query;
  console.info(`username - ${username}`);

  if (!username || !goal) {
    res.status(400);
    throw new Error("Username or goal is missing");
  }

  const queryString =
    "UPDATE users set goal = $1 where username = $2 RETURNING *";
  const { rows } = await pool.query(queryString, [goal, username]);

  console.info(`rows - ${JSON.stringify(rows)}`);

  if (rows.length === 0) {
    res.status(404);
    throw new Error("username is invalid");
  } else {
    res.status(200).json({
      ...rows[0],
      message: "Goal updated successfully",
    });
  }
});

/**
 * @description Method to get the budget
 */
const getSavings = asyncHandler(async (req, res) => {
  const { username, year, month } = req.query;
  console.info(`username - ${username} :: year - ${year} :: month - ${month}`);

  if (!username || !year || !month) {
    res.status(400);
    throw new Error("Username, year or month is missing");
  }

  const queryString = `
  SELECT u.username, EXTRACT(YEAR FROM t.date) as year, EXTRACT(MONTH FROM t.date) as month, (
COALESCE(sum(CASE WHEN tt.type = 'Income' THEN t.amount ELSE 0 END), 0) -
COALESCE(sum(CASE WHEN tt.type = 'Expense' THEN t.amount ELSE 0 END), 0) + 
COALESCE(sum(CASE WHEN tt.type = 'Investment' THEN t.amount ELSE 0 END), 0) +
COALESCE(sum(CASE WHEN tt.type = 'Gift' THEN t.amount ELSE 0 END), 0) + 
COALESCE(sum(CASE WHEN tt.type = 'Reimbursement' THEN t.amount ELSE 0 END), 0) -
COALESCE(sum(CASE WHEN tt.type = 'Transfer' THEN t.amount ELSE 0 END), 0))
as savings
FROM users as u
LEFT JOIN transactions as t ON u.username = t.username
LEFT JOIN transaction_types as tt ON t.transaction_type_id = tt.id
WHERE u.username = $1
AND EXTRACT(YEAR FROM t.date) = $2
AND EXTRACT(MONTH FROM t.date) = $3
GROUP BY u.username, year, month;
  `;

  const { rows } = await pool.query(queryString, [username, year, month]);

  console.info(`rows - ${JSON.stringify(rows)}`);

  if (rows.length === 0) {
    res.status(404);
    throw new Error("username is invalid");
  } else {
    res.status(200).json(rows[0]);
  }
});

module.exports = {
  createUser,
  getUser,
  getBudget,
  setBudget,
  getRemainingBudget,
  setGoal,
  getGoal,
  getSavings,
};
