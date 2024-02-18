const { Client } = require("pg");
require("dotenv").config();

//connect to elephant SQL db
const pool = new Client({
  connectionString: process.env.PG_ELEPHANT_URL,
  ssl: false,
  database: "evvfpcoa",
});

pool
  .connect()
  .then(() => {
    console.info("We have connected Successfully to PG");
  })
  .catch((err) => {
    console.error(err);
  });

module.exports = pool;
