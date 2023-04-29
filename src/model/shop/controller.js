const pool = require("../../utils/db");
const queries = require("./queries");

const validator = require("../../utils/validate");
const ROLES = require("../../shared/constants").ROLES;

const getShops = (req, res) => {
  if (req.role !== ROLES.ADMIN) {
    res.status(401).json({
      message: "unauthorized",
      info: "attempting to access a function not intended for role.",
      kaocode: "( •̀ - •́ )",
    });
    return;
  }

  pool.query(queries.getShops, (error, results) => {
    if (error) {
      res.status(500).json({
        message: "Internal server error",
        info: "get users failed",
        kaocode: ":-(",
      });
      return;
    }

    res.status(200).json(...results.rows);
  });
};

const getShopByID = (req, res) => {
  const id = parseInt(req.params.id);

  pool.query(queries.getShopByID, [id], (error, results) => {
    if (error) {
      res.status(500).json({
        message: "Internal server error",
        info: "get shop by id failed",
        kaocode: ":-(",
      });
      return;
    }

    res.status(200).json(results.rows[0]);
  });
};

const getShopByName = (req, res) => {
  const name = req.body.name;

  pool.query(queries.getShopByName, [name], (error, results) => {
    if (error) {
      res.status(500).json({
        message: "Internal server error",
        info: "get shop by name failed",
        kaocode: ":-(",
      });
      return;
    }

    res.status(200).json(results.rows[0]);
  });
};

const createShop = (req, res) => {
  // Create shop and then assign it to user, required information about the shop & user id
};

const updateShop = (req, res) => {
  // Updates the shop information, requires shopId, userId, password verification
};

const deleteShop = (req, res) => {
  const id = parseInt(req.params.id);
  // Password must be first confirmed before launching this request
  // 1. Req (userid)
  // 2. DELETE FROM table WHERE ownerId = thisthat
  // 3. SET user shopid = null
  // Deletes the shop and deattaches it from the user, requires shopId, userId, password verification
};

const validateShop = (data, res) => {
  const arrayValidation = [
    validator.validate(data[0], validator.INFO.ALL_L50_ONLY), // Shop name
    data[1] === null
      ? [true]
      : validator.validate(data[1], validator.INFO.OPTIONAL_ALL_L20_ONLY), // Shop hint
    validator.validate(data[2], validator.INFO.ALL_L256_ONLY), // Shop description
  ];

  for (let i = 0; i < arrayValidation.length; i++) {
    if (!arrayValidation[i][0]) {
      res.status(400).json({
        message: "bad request",
        info: arrayValidation[i][1](`input '${data[i]}'`),
        kaocode: ":-(",
      });
      return false;
    }
  }
  return true;
};

module.exports = {
  getShops,
  getShopByID,
  getShopByName,
  updateShop,
  deleteShop,
};
