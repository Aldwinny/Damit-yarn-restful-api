const TABLE = "items";
const REVIEWS_TABLE = "reviews";
const CARTS_TABLE = "carts";
const TRANSACTIONS_TABLE = "transactions";

// CREATE queries
const createItem = `INSERT INTO ${TABLE} (name, description, price, keywords, shopid, image) VALUES ($1, $2, $3, $4, $5, $6)`;

const addToCart = `INSERT INTO ${CARTS_TABLE} (itemid, userid, quantity) VALUES ($1, $2, 1) RETURNING *`;
const addTransaction = `INSERT INTO ${TRANSACTIONS_TABLE} (user_id, items, quantities, total, method) VALUES ($1, $2, $3, $4, $5)`;

// READ queries
const getItems = `SELECT ${TABLE}.*, shops.name shopname, shops.description shopdescription, shops.hint shophint, users.city || \', \' || users.country location, users.image shopimage, CAST(COALESCE((SELECT AVG(reviews.stars) FROM reviews WHERE reviews.itemid = ${TABLE}.id), 0) AS DOUBLE PRECISION) stars FROM ${TABLE} JOIN shops ON ${TABLE}.shopid = shops.id JOIN users ON shops.id = users.shopid`;
const getItemsByID = `SELECT ${TABLE}.*, shops.name shopname, shops.description shopdescription, shops.hint shophint, users.city || \', \' || users.country location, users.image shopimage, CAST(COALESCE((SELECT AVG(reviews.stars) FROM reviews WHERE reviews.itemid = ${TABLE}.id), 0) AS DOUBLE PRECISION) stars FROM ${TABLE} JOIN shops ON ${TABLE}.shopid = shops.id JOIN users ON shops.id = users.shopid WHERE ${TABLE}.id = $1`;
const getItemsByShopID = `SELECT ${TABLE}.*, shops.name shopname, shops.description shopdescription, shops.hint shophint, users.city || \', \' || users.country location, users.image shopimage, CAST(COALESCE((SELECT AVG(reviews.stars) FROM reviews WHERE reviews.itemid = ${TABLE}.id), 0) AS DOUBLE PRECISION) stars FROM ${TABLE} JOIN shops ON ${TABLE}.shopid = shops.id JOIN users ON shops.id = users.shopid WHERE ${TABLE}.shopid = $1`;
const getItemsSortByTaps = `SELECT ${TABLE}.*, shops.name shopname, shops.description shopdescription, shops.hint shophint, users.city || \', \' || users.country location, users.image shopimage, CAST(COALESCE((SELECT AVG(reviews.stars) FROM reviews WHERE reviews.itemid = ${TABLE}.id), 0) AS DOUBLE PRECISION) stars FROM ${TABLE} JOIN shops ON ${TABLE}.shopid = shops.id JOIN users ON shops.id = users.shopid ORDER BY taps DESC`;

const getLikedItems = `SELECT ${TABLE}.*, shops.name shopname, shops.description shopdescription, shops.hint shophint, users.city || \', \' || users.country location, users.image shopimage, CAST(COALESCE((SELECT AVG(reviews.stars) FROM reviews WHERE reviews.itemid = ${TABLE}.id), 0) AS DOUBLE PRECISION) stars FROM ${TABLE} JOIN shops ON ${TABLE}.shopid = shops.id JOIN users ON shops.id = users.shopid WHERE ${TABLE}.id = ANY ($1::int[])`;

const getItemReviews = `SELECT ${REVIEWS_TABLE}.*, users.username name, users.image reviewerimage FROM ${REVIEWS_TABLE} JOIN users ON reviews.userid = users.id WHERE itemid = $1`;

const getCartItems = `SELECT * FROM ${CARTS_TABLE}`;
const getCartItemsByUser = `SELECT ${CARTS_TABLE}.id id, ${CARTS_TABLE}.itemid itemid, ${CARTS_TABLE}.quantity qty, ${TABLE}.name name, ${TABLE}.price price, ${TABLE}.image images, shops.name shopname FROM ${CARTS_TABLE} JOIN ${TABLE} ON ${CARTS_TABLE}.itemid = ${TABLE}.id JOIN shops ON ${TABLE}.shopid = shops.id WHERE userid = $1`;
const getCartItemByID = `SELECT * FROM ${CARTS_TABLE} WHERE itemid = $1 AND userid = $2`;

const getTransactionByID = `SELECT * FROM ${TRANSACTIONS_TABLE} WHERE user_id = $1`;

// UPDATE queries
const updateItem = `UPDATE ${TABLE} SET name = $1, description = $2, price = $3, keywords = $4, image = $5 WHERE id = $6`;
const updateItemImage = `UPDATE ${TABLE} SET image = ARRAY_APPEND(ARRAY_REMOVE(image, $1), $2) WHERE $1=ANY(image)`;
const addItemImage = `UPDATE ${TABLE} SET image = ARRAY_APPEND(image, $1) WHERE id = $2`;
const deleteItemImage = `UPDATE ${TABLE} SET image = ARRAY_REMOVE(image, $1) WHERE $1=ANY(image)`;

const incrementQuantity = `UPDATE ${CARTS_TABLE} SET quantity = quantity + 1 WHERE itemid = $1 AND userid = $2`;
const setQuantity = `UPDATE ${CARTS_TABLE} SET quantity = $1 WHERE itemid = $2 AND userid = $3`;

// DELETE queries
const deleteItem = `DELETE FROM ${TABLE} WHERE id = $1`;
const deleteFromCart = `DELETE FROM ${CARTS_TABLE} WHERE itemid = $1 AND userid = $2`;
const deleteCartItemsByID = `DELETE FROM ${CARTS_TABLE} WHERE userid = $1`;

module.exports = {
  getItems,
  getItemsByID,
  getItemsByShopID,
  getItemsSortByTaps,
  getItemReviews,
  getCartItemsByUser,
  getCartItems,
  getCartItemByID,
  deleteFromCart,
  setQuantity,
  incrementQuantity,
  createItem,
  updateItem,
  deleteItem,
  addToCart,
  updateItemImage,
  addItemImage,
  deleteItemImage,
  deleteCartItemsByID,
  addTransaction,
  getTransactionByID,
  getLikedItems,
};
