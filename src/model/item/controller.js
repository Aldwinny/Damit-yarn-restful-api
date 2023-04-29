const pool = require("../../utils/db");
const queries = require("./queries");

const validator = require("../../utils/validate");
const ROLES = require("../../shared/constants").ROLES;

const getItems = (req, res) => {
  const shopId = parseInt(req.query.id);

  if (shopId !== undefined && !isNaN(shopId)) {
    pool.query(queries.getItemsByShopID, [shopId], (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json({
          message: "Internal server error",
          info: "get items failed",
          kaocode: ":-(",
        });
        return;
      }

      res.status(200).json(results.rows);
    });
    return;
  }

  const taps = req.query.taps;

  console.log(taps);

  if (taps !== undefined) {
    pool.query(queries.getItemsSortByTaps, (error, results) => {
      if (error) {
        res.status(500).json({
          message: "Internal server error",
          info: "get items failed",
          kaocode: ":-(",
        });
        return;
      }

      res.status(200).json(results.rows);
    });
    return;
  }

  pool.query(queries.getItems, (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
        info: "get items failed",
        kaocode: ":-(",
      });
      return;
    }

    res.status(200).json(results.rows);
    return;
  });
};

const getItemsByID = (req, res) => {
  const id = parseInt(req.params.id);

  pool.query(queries.getItemsByID, [id], (error, results) => {
    if (error) {
      res.status(500).json({
        message: "Internal server error",
        info: "get items failed",
        kaocode: ":-(",
      });
      return;
    }

    res.status(200).json(results.rows[0]);
  });

  return;
};

const getItemReviews = (req, res) => {
  const id = parseInt(req.params.id);

  pool.query(queries.getItemReviews, [id], (error, results) => {
    if (error) {
      res.status(500).json({
        message: "Internal server error",
        info: "get reviews failed",
        kaocode: ":-(",
      });
      return;
    }

    console.log(results.rows);
    res.status(200).json(results.rows);
  });
  return;
};

const addToCart = (req, res) => {
  if (req.role === undefined) {
    res.status(401).send({
      message: "unauthorized",
      info: "attempting to access a function not intended for role.",
      kaocode: "( •̀ - •́ )",
    });
    return;
  }

  const { item, user } = req.body.data;

  pool.query(queries.getCartItemByID, [item, user], (error, results) => {
    if (error) {
      res.status(500).json({
        message: "Internal server error",
        info: "get carts failed",
        kaocode: ":-(",
      });
      return;
    }

    if (results.rowCount) {
      console.log("woah");
      pool.query(
        queries.incrementQuantity,
        [item, user],
        (errorA, resultsA) => {
          if (errorA) {
            res.status(500).json({
              message: "Internal server error",
              info: "increment failed",
              kaocode: ":-(",
            });
            return;
          }

          console.log("for testing");

          res.status(200).json({
            message: "Success",
            kaocode: "(･ω･)b",
          });
          return;
        }
      );
    } else {
      pool.query(queries.addToCart, [item, user], (errorB, resultsB) => {
        if (errorB) {
          res.status(500).json({
            message: "Internal server error",
            info: "add to cart failed",
            kaocode: ":-(",
          });
          return;
        }

        console.log("for testing; checking of values");

        res.status(200).json({
          message: "Success",
          kaocode: "(･ω･)b",
        });
        return;
      });
    }
  });
  return;
};

module.exports = {
  getItems,
  getItemsByID,
  getItemReviews,
  addToCart,
};
