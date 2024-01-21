const asyncHandler = require("express-async-handler");

const pool = require("../config/db");

/**
 * @description Method get the user
 */
const getUser = asyncHandler(async (req, res) => {
  const { username, password } = req.params;
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
  const { username, password, email, currency_id } = req.body;
  if (!username || !password || !email || !currency_id) {
    res.status(400);
    throw new Error("Please add all the details");
  }

  const queryString =
    "INSERT INTO users (username, password, email, currency_id) VALUES ($1, $2, $3, $4) RETURNING *";
  const { rows } = await pool.query(queryString, [
    username,
    password,
    email,
    currency_id,
  ]);
  res.status(201).json(rows);
});

module.exports = {
  createUser,
  getUser,
};
