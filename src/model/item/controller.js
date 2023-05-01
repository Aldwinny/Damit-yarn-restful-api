const pool = require("../../utils/db");
const queries = require("./queries");

const validator = require("../../utils/validate");
const cloudinary = require("../../utils/cloudinary");
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
  console.log(item, user);

  pool.query(queries.getCartItemByID, [item, user], (error, results) => {
    if (error) {
      res.status(500).json({
        message: "Internal server error",
        info: "get carts failed",
        kaocode: ":-(",
      });
      return;
    }

    console.log(results.rowCount);

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

const updateCart = (req, res) => {
  if (req.role === undefined) {
    res.status(401).send({
      message: "unauthorized",
      info: "attempting to access a function not intended for role.",
      kaocode: "( •̀ - •́ )",
    });
    return;
  }

  // 1. Get user data and cart items
  // 2. Get cart items and then cache it for comparation
  // 3. Compare the cart items and the new stuff then merge them into 1
  // 4. Update cart data in database
  // 3. return to user the updated thing.
  // 4. -> Frontend handles the rest

  const { items, user } = req.body;

  console.log("Updating cart data..");

  pool.query(queries.getCartItemsByUser, [user], (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).send({
        message: "internal server error",
        info: "Failed to get items from cart",
        kaocode: ":-(",
      });
      return;
    }

    // old items contains itemid, qty, and updateDB
    const newItems = results.rows.map((item) => {
      // This is some bad code with O(n^2) complexity

      const matchingItem = items.filter((e) => e.id === item.id);

      if (matchingItem.length !== 0) {
        pool.query(
          queries.setQuantity,
          [parseInt(matchingItem[0]?.qty), item.itemid, user],
          (error, results) => {
            if (error) {
              console.log(error);
            }
          }
        );
      }

      return {
        ...item,
        qty: matchingItem[0]?.updated
          ? parseInt(matchingItem[0]?.qty)
          : item.qty,
      };
    });

    res.status(200).json({
      message: "Success",
      items: newItems,
      kaocode: "(･ω･)b",
    });
  });
  return;
};

const getCart = (req, res) => {
  if (req.role === undefined) {
    res.status(401).send({
      message: "unauthorized",
      info: "attempting to access a function not intended for role.",
      kaocode: "( •̀ - •́ )",
    });
    return;
  }

  const { user } = req.query;

  pool.query(queries.getCartItemsByUser, [user], (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).send({
        message: "internal server error",
        info: "Failed to get items from cart",
        kaocode: ":-(",
      });
      return;
    }

    res.status(200).json({
      message: "Success",
      kaocode: "(･ω･)b",
      items: results.rows,
    });
    return;
  });
  return;
};

const removeCart = (req, res) => {
  if (req.role === undefined) {
    res.status(401).send({
      message: "unauthorized",
      info: "attempting to access a function not intended for role.",
      kaocode: "( •̀ - •́ )",
    });
    return;
  }

  const { item, user } = req.query;

  console.log(item, user);

  pool.query(queries.deleteFromCart, [item, user], (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).send({
        message: "internal server error",
        info: "Failed to delete item from cart",
        kaocode: ":-(",
      });
      return;
    }

    res.status(200).json({
      message: "Success",
      kaocode: "(･ω･)b",
    });
  });
  return;
};

const addTransaction = (req, res) => {
  if (req.role === undefined) {
    res.status(401).send({
      message: "unauthorized",
      info: "attempting to access a function not intended for role.",
      kaocode: "( •̀ - •́ )",
    });
    return;
  }

  const { id, items, quantities, total, method } = req.body;

  pool.query(
    queries.addTransaction,
    [id, items, quantities, total, method],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).send({
          message: "internal server error",
          info: "Failed to record transaction",
          kaocode: ":-(",
        });
        return;
      }

      pool.query(queries.deleteCartItemsByID, [id], (error, results) => {
        if (error) {
          console.log(error);
          res.status(500).send({
            message: "internal server error",
            info: "Failed to delete cart",
            kaocode: ":-(",
          });
          return;
        }

        console.log("Recorded transaction");

        res.status(200).json({
          message: "Success",
          kaocode: "(･ω･)b",
        });
      });
    }
  );
  return;
};

const getTransactionByID = (req, res) => {
  if (req.role === undefined) {
    res.status(401).send({
      message: "unauthorized",
      info: "attempting to access a function not intended for role.",
      kaocode: "( •̀ - •́ )",
    });
    return;
  }

  const { id } = req.query;

  pool.query(queries.getTransactionByID, [id], (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).send({
        message: "internal server error",
        info: "Failed to record transaction",
        kaocode: ":-(",
      });
      return;
    }
    res.status(200).json({
      message: "Success",
      transactions: results.rows,
      kaocode: "(･ω･)b",
    });
  });

  return;
};

const getLikes = (req, res) => {
  if (req.role === undefined) {
    res.status(401).send({
      message: "unauthorized",
      info: "attempting to access a function not intended for role.",
      kaocode: "( •̀ - •́ )",
    });
    return;
  }

  const { likes } = req.query;

  if (likes.length === 0) {
    res.status(400).send({
      message: "Bad request",
      info: "Likes array is empty.",
      kaocode: ":-(",
    });
    return;
  }

  const cleanedLikes = likes.map((i) => parseInt(i));

  pool.query(queries.getLikedItems, [cleanedLikes], (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).send({
        message: "internal server error",
        info: "Failed to get liked items.",
        kaocode: ":-(",
      });
      return;
    }

    res.status(200).json({
      message: "Success",
      items: results.rows,
      kaocode: "(･ω･)b",
    });
  });
  return;
};

const createItemData = (req, res) => {
  if (req.role === undefined) {
    res.status(401).send({
      message: "unauthorized",
      info: "attempting to access a function not intended for role.",
      kaocode: "( •̀ - •́ )",
    });
    return;
  }

  const { name, description, price, keywords, images, shop } = req.body;

  pool.query(
    queries.createItem,
    [name, description, price, keywords, shop, images],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json({
          message: "Internal server error",
          info: "Create item failed",
          kaocode: ":-(",
        });
        return;
      }

      res.status(201).json({
        message: "success",
        kaocode: ":-)",
      });
      return;
    }
  );
};

const updateItemData = (req, res) => {
  const id = parseInt(req.params.id);

  const { name, description, price, keywords, images, shop } = req.body;

  // Validate Item
  // TODO: Validation

  // Update Item
  pool.query(
    queries.updateItem,
    [name, description, price, keywords, images, id],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json({
          message: "Internal Server Error",
          kaocode: ":-(",
        });
        return;
      }

      console.log("Updated Successfully");

      res.status(200).json({
        message: "success",
        kaocode: ":-)",
      });
    }
  );
  return;
};

const deleteItemData = (req, res) => {
  const id = parseInt(req.params.id);

  pool.query(queries.getItemsByID, [id], (error, results) => {
    if (error) {
      console.log(error);
      console.log("failed to get item by ID");
    }

    const images = results.rows[0].image;
    images.forEach((e) => cloudinary.deleteImage(e));

    pool.query(queries.deleteItem, [id], (error, results) => {
      if (error) {
        console.log(error);
        console.log("failed to delete item");
      }

      res.status(200).json({
        message: "success",
        kaocode: ":-)",
      });
      return;
    });
  });
};

const uploadImagePhoto = (req, res) => {
  console.log("on its way update");
  if (req.role === undefined) {
    res.status(401).send({
      message: "unauthorized",
      info: "attempting to access a function not intended for role.",
      kaocode: "( •̀ - •́ )",
    });
    return;
  }

  const image = req.file;

  const { old, update, id } = req.query;
  console.log(old, update, id);

  cloudinary.uploadImage(image).then((link) => {
    if (old && update) {
      cloudinary.deleteImage(old);

      pool.query(queries.updateItemImage, [old, link], (error, results) => {
        if (error) {
          console.log(error);
          console.log("Failed to remove image");
        }
      });
    } else if (update) {
      pool.query(queries.addItemImage, [link, id], (error, results) => {
        if (error) {
          console.log(error);
          console.log("Failed to append image to database");
        }
      });
    } else if (old) {
      cloudinary.deleteImage(old);
    }

    res.status(201).json({
      message: "success",
      image: link,
      kaocode: ":-)",
    });
  });
  return;
};

const deleteImagePhoto = (req, res) => {
  console.log("on its way delete");
  const { old, update, id } = req.query;

  console.log(old, update, id);

  if (old) {
    cloudinary.deleteImage(old);

    if (update) {
      pool.query(queries.deleteItemImage, [old], (error, results) => {
        if (error) {
          console.log(error);
          console.log("Failed to remove item from database");
        }
      });
    }

    res.status(200).json({
      message: "success",
      info: "image successfully deleted",
      kaocode: ":-)",
    });
    return;
  }

  res.status(500).json({
    message: "Internal Server Error",
    kaocode: ":-(",
  });
  return;
};

module.exports = {
  getItems,
  getItemsByID,
  getItemReviews,
  addToCart,
  updateCart,
  removeCart,
  getCart,
  uploadImagePhoto,
  deleteImagePhoto,
  updateItemData,
  deleteItemData,
  createItemData,
  getTransactionByID,
  addTransaction,
  getLikes,
};
