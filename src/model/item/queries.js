const TABLE = "items";
const REVIEWS_TABLE = "reviews";
const CARTS_TABLE = "carts";

// CREATE queries
const createItem = ``;

const addToCart = `INSERT INTO ${CARTS_TABLE} (userid, itemid, quantity) VALUES ($1, $2, 1) RETURNING *`;

// READ queries
const getItems = `SELECT ${TABLE}.*, shops.name shopname, shops.description shopdescription, shops.hint shophint, users.city || \', \' || users.country location, CAST(COALESCE((SELECT AVG(reviews.stars) FROM reviews WHERE reviews.itemid = ${TABLE}.id), 0) AS DOUBLE PRECISION) stars FROM ${TABLE} JOIN shops ON ${TABLE}.shopid = shops.id JOIN users ON shops.id = users.shopid`;
const getItemsByID = `SELECT ${TABLE}.*, shops.name shopname, shops.description shopdescription, shops.hint shophint, users.city || \', \' || users.country location, CAST(COALESCE((SELECT AVG(reviews.stars) FROM reviews WHERE reviews.itemid = ${TABLE}.id), 0) AS DOUBLE PRECISION) stars FROM ${TABLE} JOIN shops ON ${TABLE}.shopid = shops.id JOIN users ON shops.id = users.shopid WHERE ${TABLE}.id = $1`;
const getItemsByShopID = `SELECT ${TABLE}.*, shops.name shopname, shops.description shopdescription, shops.hint shophint, users.city || \', \' || users.country location, CAST(COALESCE((SELECT AVG(reviews.stars) FROM reviews WHERE reviews.itemid = ${TABLE}.id), 0) AS DOUBLE PRECISION) stars FROM ${TABLE} JOIN shops ON ${TABLE}.shopid = shops.id JOIN users ON shops.id = users.shopid WHERE ${TABLE}.shopid = $1`;
const getItemsSortByTaps = `SELECT ${TABLE}.*, shops.name shopname, shops.description shopdescription, shops.hint shophint, users.city || \', \' || users.country location, CAST(COALESCE((SELECT AVG(reviews.stars) FROM reviews WHERE reviews.itemid = ${TABLE}.id), 0) AS DOUBLE PRECISION) stars FROM ${TABLE} JOIN shops ON ${TABLE}.shopid = shops.id JOIN users ON shops.id = users.shopid ORDER BY taps DESC`;

const getItemReviews = `SELECT ${REVIEWS_TABLE}.*, users.username name FROM ${REVIEWS_TABLE} JOIN users ON reviews.userid = users.id WHERE itemid = $1`;

const getCartItems = `SELECT * FROM ${CARTS_TABLE}`;
const getCartItemByID = `SELECT * FROM ${CARTS_TABLE} WHERE itemid = $1 AND userid = $2`;

// UPDATE queries
const updateItem = ``;

const incrementQuantity = `UPDATE ${CARTS_TABLE} SET quantity = quantity + 1 WHERE itemid = $1 AND userid = $2`;
const setQuantity = `UPDATE ${CARTS_TABLE} SET quantity = $1 WHERE itemid = $2 AND userid = $3`;

// DELETE queries
const deleteItem = ``;
const deleteFromCart = ``;

module.exports = {
  getItems,
  getItemsByID,
  getItemsByShopID,
  getItemsSortByTaps,
  getItemReviews,
  getCartItems,
  getCartItemByID,
  incrementQuantity,
  createItem,
  updateItem,
  deleteItem,
};
