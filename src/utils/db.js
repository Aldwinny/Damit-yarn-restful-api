// Resolve all dotenv variables
require("dotenv").config();

const Pool = require("pg").Pool;

// TODO: Bring to an .env
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: "damit_yarn",
  password: process.env.PG_PASSWORD,
  port: parseInt(process.env.PG_PORT),
  ssl: true,
});

module.exports = pool;
