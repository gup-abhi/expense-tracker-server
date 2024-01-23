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

module.exports = {
  createUser,
  getUser,
  getBudget,
};
