const asyncHandler = require("express-async-handler");
const { sendWelcomeEmail } = require("../email-templates/newUserMail");

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
    "SELECT username, active FROM users WHERE username = $1 AND password = $2";
  const { rows } = await pool.query(queryString, [username, password]);

  console.info(`rows - ${JSON.stringify(rows)}`);

  if (rows.length === 0) {
    res.status(404);
    throw new Error("Username or password is invalid");
  } else {
    const user = rows[0];
    if (!user.active) {
      res
        .status(400)
        .json({ message: "Verification pending", username: user.username });
    } else {
      res.status(200).json({
        message: "User successfully logged in",
        username: user.username,
      });
    }
  }
});

/**
 * @description Method to create a new user
 */
const createUser = asyncHandler(async (req, res) => {
  const { username, password, email, currency_id, budget, saving_goal } =
    req.body;
  if (!username || !password || !email || !currency_id) {
    res.status(400);
    throw new Error("Please add all the details");
  }

  const queryString =
    "INSERT INTO users (username, password, email, currency_id, budget, goal) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
  try {
    const { rows } = await pool.query(queryString, [
      username,
      password,
      email,
      currency_id,
      budget,
      saving_goal,
    ]);

    console.log(`rows - ${JSON.stringify(rows)}`);

    if (rows.length) {
      const host = req.get("host");
      const protocol = req.protocol;
      const hash = await sendMailAfterRegistration(username);

      await sendWelcomeEmail(
        rows[0].email,
        rows[0].username,
        `${protocol}://${host}/api/user/verify/${hash}`
      );
      res
        .status(201)
        .json({
          message:
            "User created successfully. An email is sent with verification link, Please verify the account using the link.",
        });
    } else {
      console.log(`rows - ${JSON.stringify(rows)}`);
      res.status(500).send("An error occurred on the server");
    }
  } catch (error) {
    if (error.code === "23505") {
      // 23505 is the code for unique_violation in PostgreSQL
      res.status(400).json({ message: "Username or email already exists" });
    } else {
      console.error(error);
      res.status(500).send("An error occurred on the server");
    }
  }
});

/**
 * @description This method is used to send email to new registered user
 * @param {*} username
 * @returns
 */
const sendMailAfterRegistration = async (username) => {
  const queryString = `SELECT * FROM user_verification WHERE username = $1`;

  try {
    const { rows } = await pool.query(queryString, [username]);

    if (rows.length > 0) {
      console.log(`rows - ${JSON.stringify(rows)}`);
      return rows[0].hash;
    } else {
      console.error("No verification record found for the user:", username);
      return null; // Return null or throw an error, depending on your requirements
    }
  } catch (error) {
    console.error("Error retrieving verification record:", error);
    // Handle the error appropriately, such as returning null or rethrowing the error
    return null;
  }
};

/**
 * @description Method to verify user
 */
const verifyUser = asyncHandler(async (req, res) => {
  const { hash } = req.params;
  console.info(`hash - ${hash}`);

  const queryString = "SELECT username FROM user_verification where hash = $1";
  const { rows } = await pool.query(queryString, [hash]);

  console.info(`rows - ${JSON.stringify(rows)}`);

  if (rows.length === 0) {
    res.status(404);
    throw new Error("Token is invalid");
  } else {
    await updateActiveStatus(rows[0].username);
    res.status(200).send(`<h1>Verified</h1>`);
  }
});

/**
 * @description This method is used to update active column value for new user
 * @param {*} username
 * @returns
 */
const updateActiveStatus = async (username) => {
  const queryString = `UPDATE users SET active = true where username = $1`;

  try {
    const { rows } = await pool.query(queryString, [username]);
    return true;
  } catch (error) {
    console.error(error);
  }
};

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
  verifyUser,
};
