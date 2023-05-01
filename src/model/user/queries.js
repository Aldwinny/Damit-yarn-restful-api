// Properties
const TABLE = "users";

// CREATE queries
const createUser = `INSERT INTO ${TABLE} (username, firstname, middlename, lastname, code, contact, email, street, zip, city, country, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`;

// READ queries
const getUsers = `SELECT * FROM ${TABLE}`;
const getUserByID = `SELECT * FROM ${TABLE} WHERE id = $1`;
const getUserByEmail = `SELECT * FROM ${TABLE} WHERE email = $1`;

// UPDATE queries
const updateUser = `UPDATE ${TABLE} SET firstname = $1, middlename = $2, lastname = $3, code = $4, contact = $5, street = $6, zip = $7, city = $8, country = $9 WHERE id = $10 RETURNING *`;
const updateUserShop = `UPDATE ${TABLE} SET shopid = $1 WHERE id = $2`;
const updateUserImage = `UPDATE ${TABLE} SET image = $1 WHERE id = $2`;

// DELETE queries
const deleteUser = `DELETE FROM ${TABLE} WHERE id = $1`;

// Check Validations
const checkIfConflicting = `SELECT u FROM ${TABLE} u WHERE u.email = $1 OR u.username = $2`;

module.exports = {
  createUser,
  getUsers,
  getUserByID,
  updateUser,
  deleteUser,
  checkIfConflicting,
  getUserByEmail,
  updateUserShop,
  updateUserImage,
};
