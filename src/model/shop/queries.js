const TABLE = "shops";

// CREATE queries
const createShop = `INSERT INTO ${TABLE} (name, hint, description, ownerid) VALUES ($1, $2, $3, $4) RETURNING *`;

// READ queries
const getShops = `SELECT * FROM ${TABLE}`;
const getShopByID = `SELECT * FROM ${TABLE} WHERE id = $1`;
const getShopByName = `SELECT * FROM ${TABLE} WHERE name = $1`;

// UPDATE queries
const updateShop = `UPDATE ${TABLE} SET name = $1, hint = $2, description = $3 WHERE id = $4 RETURNING *`;

// DELETE queries
const deleteShop = `DELETE FROM ${TABLE} WHERE id = $1`;

module.exports = {
  createShop,
  getShopByID,
  getShops,
  getShopByName,
  updateShop,
  deleteShop,
};
