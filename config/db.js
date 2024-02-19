const { Client } = require("pg");
require("dotenv").config();

//connect to elephant SQL db
const pool = new Client({
  // connectionString: process.env.PG_ELEPHANT_URL,
  ssl: true,
  database: "evvfpcoa",
  host: "heffalump.db.elephantsql.com",
  user: "evvfpcoa",
  password: "g_HvoPliT-_VOheTRSh2UFIyUP1eD3iS",
  port: 5432,
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
