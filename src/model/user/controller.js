const pool = require("../../utils/db");
const queries = require("./queries");
const shopQueries = require("../shop/queries");
const jwt = require("../../utils/token");

const validator = require("../../utils/validate");
const cloudinary = require("../../utils/cloudinary");

const bcrypt = require("../../utils/password");

const ROLES = require("../../shared/constants").ROLES;

const getUsers = (req, res) => {
  if (req.role !== ROLES.ADMIN) {
    res.status(401).send({
      message: "unauthorized",
      info: "attempting to access a function not intended for role.",
      kaocode: "( •̀ - •́ )",
    });
    return;
  }

  pool.query(queries.getUsers, (error, results) => {
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

const getUserByID = (req, res) => {
  const id = parseInt(req.params.id);

  switch (req.role) {
    case ROLES.ADMIN:
      pool.query(queries.getUserByID, [id], (error, results) => {
        if (error) {
          res.status(500).json({
            message: "Internal server error",
            info: "get user by id failed",
            kaocode: ":-(",
          });
          return;
        }

        res.status(200).json(results.rows[0]);
      });
      return;
    case ROLES.USER:
      pool.query(queries.getUserByID, [id], (error, results) => {
        if (error) {
          res.status(500).json({
            message: "Internal server error",
            info: "get user by id failed",
            kaocode: ":-(",
          });
          return;
        }

        if (results.rows[0].username !== req.username) {
          res.status(401).send({
            message: "unauthorized",
            info: "attempting to access a function not intended for user.",
            kaocode: "( •̀ - •́ )",
          });
          return;
        }

        res.status(200).json(results.rows[0]);
      });
      return;
    default:
      res.status(401).send({
        message: "unauthorized",
        info: "attempting to access a function not intended for role.",
        kaocode: "( •̀ - •́ )",
      });
      return;
  }
};

const addUser = (req, res) => {
  const {
    username,
    firstname,
    middlename,
    lastname,
    code,
    contact,
    email,
    street,
    zip,
    city,
    country,
    password,
    hasShop,
    shopName,
    shopHint,
    shopDescription,
  } = req.body;

  if (req.role === ROLES.USER) {
    res.status(401).send({
      message: "unauthorized",
      info: "attempting to access a function not intended for role.",
      kaocode: "( •̀ - •́ )",
    });
    return;
  }

  let userData = [
    username,
    firstname,
    middlename,
    lastname,
    code,
    contact,
    email.toLowerCase(),
    street,
    zip,
    city,
    country,
    password,
  ];
  let shopData = [shopName, shopHint, shopDescription];

  // Validate user input
  if (userData.some((item) => item === undefined)) {
    console.log("user");
    res.status(400).json({
      message: "bad request",
      info: "user data incomplete",
      kaomoji: ":-(",
    });
    return;
  }

  let isValidAll = validateUser(userData, res);
  if (!isValidAll) return;

  // Update user password using BCrypt
  userData[userData.length - 1] = bcrypt.hash(userData[userData.length - 1]);

  // validate shop input
  if (hasShop) {
    if (shopData.some((item) => item === undefined)) {
      console.log("shop");
      res.status(400).json({
        message: "bad request",
        info: "shop data incomplete",
        kaomoji: ":-(",
      });
      return;
    }

    let isValidShop = validateShop(shopData, res);
    if (!isValidShop) return;
  }

  // Check if email & username exists
  pool.query(queries.checkIfConflicting, [email, username], (error, result) => {
    if (result.rows.length) {
      res.status(409).json({
        message: "conflict",
        info: "email or username in use.",
        kaocode: ":-(",
      });
      return;
    }

    if (hasShop) {
      // Check if shop has similar name
      pool.query(
        shopQueries.getShopByName,
        [shopName],
        (error, similarlyNamedShops) => {
          if (error) {
            console.log("Error while getting similaryly named shops");
            console.log(error);
            res.status(500).json({
              message: "Internal server error",
              info: "get shop by name failed",
              kaocode: ":-(",
            });
            return;
          }

          // Check if there are other shops with similar name
          if (!similarlyNamedShops.rows.length) {
            // Create user
            pool.query(queries.createUser, userData, (error1, user) => {
              if (error1) {
                console.log("Error 1");
                console.log(error1);
                res.status(500).json({
                  message: "Internal server error",
                  info: "user insertion rejected by database",
                  kaocode: ":-(",
                });
                return;
              }

              // Create shop
              pool.query(
                shopQueries.createShop,
                [...shopData, parseInt(user.rows[0].id)],
                (error2, shopResult) => {
                  if (error2) {
                    console.log(error2);
                    res.status(500).json({
                      message: "Internal server error",
                      info: "Creating shop failed.",
                      kaocode: ":-(",
                    });
                    return;
                  }

                  // Update user information about shop
                  pool.query(
                    queries.updateUserShop,
                    [shopResult.rows[0].id, user.rows[0].id],
                    (error4, updateResult) => {
                      if (error4) {
                        console.log(error4);
                        console.log("Error 5??");
                        res.status(500).json({
                          message: "Internal server error",
                          info: "Creating shop failed.",
                          kaocode: ":-(",
                        });
                        return;
                      }

                      res.status(201).json({
                        response: {
                          message: "User created successfully",
                          kaocode: "(･ω･)b",
                        },
                        user: {
                          ...user.rows[0],
                        },
                        token: jwt.generateToken({
                          username: user.rows[0].username,
                          role: user.rows[0].role,
                        }),
                      });
                      return;
                    }
                  );
                }
              );
            });
            return;
          }
          // Name match
          res.status(409).json({
            message: "conflict",
            info: "Shop name in use",
            kaocode: ":-(",
          });
        }
      );
      return;
    }

    pool.query(queries.createUser, userData, (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json({
          message: "Internal server error",
          info: "insertion rejected by database",
          kaocode: ":-(",
        });
        return;
      }

      // this doesn't feel right but ok
      delete results.rows[0].password;

      res.status(201).json({
        response: {
          message: "User created successfully",
          kaocode: "(･ω･)b",
        },
        user: {
          ...results.rows[0],
        },
        token: jwt.generateToken({
          username: results.rows[0].username,
          role: results.rows[0].role,
        }),
      });
    });
  });
};

const loginUser = (req, res) => {
  const { email, password } = req.body;

  // Only users without bearer tokens must be able to login
  if (req.role !== undefined) {
    res.status(401).send({
      message: "unauthorized",
      info: "attempting to access a function not intended for role.",
      kaocode: "( •̀ - •́ )",
    });
    return;
  }

  const userData = [email.trim().toLowerCase(), password];

  if (userData.some((item) => item === undefined)) {
    res.status(400).json({
      message: "bad request",
      info: "user data incomplete",
      kaomoji: ":-(",
    });
    return;
  }

  const validation = [
    validator.validate(userData[0], validator.INFO.EMAIL)[0],
    validator.validate(userData[1], validator.INFO.PASSWORD)[0],
  ];

  if (validation.some((e) => !e)) {
    res.status(400).json({
      message: "bad request",
      info: "user data validation fail.",
      kaocode: ":-(",
    });
    return;
  }

  pool.query(queries.getUserByEmail, [userData[0]], (error, results) => {
    if (error) {
      res.status(500).json({
        message: "Internal server error",
        info: "Request rejected by database",
        kaocode: ":-(",
      });
      return;
    }

    if (!results.rows.length) {
      res.status(404).json({
        message: "not found",
        info: "user not found in the database.",
        kaocode: ":-(",
      });
      return;
    }

    if (bcrypt.compare(userData[1], results.rows[0].password)) {
      // this doesn't feel right but ok
      delete results.rows[0].password;

      console.log(results.rows[0]);

      res.status(200).json({
        response: {
          message: "User obtained successfully!",
          kaocode: "(･ω･)b",
        },
        user: {
          ...results.rows[0],
        },
        token: jwt.generateToken({
          username: results.rows[0].username,
          role: results.rows[0].role,
        }),
      });
      return;
    }
    res.status(401).send({
      message: "unauthorized",
      info: "Incorrect email or password",
      kaocode: "( •̀ - •́ )",
    });
  });
};

const deleteUser = (req, res) => {
  const id = parseInt(req.params.id);

  if (req.role === undefined) {
    res.status(401).send({
      message: "unauthorized",
      info: "attempting to access a function not intended for role.",
      kaocode: "( •̀ - •́ )",
    });
  }

  pool.query(queries.getUserByID, [id], (error, results) => {
    if (error) {
      res.status(500).json({
        message: "Internal server error",
        info: "get user by id failed",
        kaocode: ":-(",
      });
      return;
    }

    const noStudentFound = !results.rows.length;

    if (noStudentFound) {
      res.status(404).json({
        message: "not found",
        info: "user not found in the database.",
        kaocode: ":-(",
      });
      return;
    }

    if (req.role === ROLES.USER && results.rows[0].username !== req.username) {
      res.status(401).send({
        message: "unauthorized",
        info: "attempting to access a function not intended for user.",
        kaocode: "( •̀ - •́ )",
      });
      return;
    }

    pool.query(queries.deleteUser, [id], (error, results) => {
      if (error) {
        res.status(500).json({
          message: "Internal server error",
          info: "deletion rejected by database",
          kaocode: ":-(",
        });
        return;
      }

      res
        .status(200)
        .json({ message: "success", info: "user successfully deleted." });
    });
  });
};

const verifyPassword = (req, res) => {
  const id = parseInt(req.body.data.id);
  const password = req.body.data.password;

  pool.query(queries.getUserByID, [id], (error, results) => {
    if (error) {
      res.status(500).json({
        message: "Internal server error",
        info: "get user by id failed",
        kaocode: ":-(",
      });
      return;
    }

    if (!results.rows.length) {
      res.status(404).json({
        message: "not found",
        info: "user not found in the database.",
        kaocode: ":-(",
      });
      return;
    }

    if (req.role === undefined) {
      console.log(req.role);
      res.status(401).send({
        message: "unauthorized",
        info: "attempting to access a function not intended for role.",
        kaocode: "( •̀ - •́ )",
      });
      return;
    }

    res.status(200).json({
      message: "success",
      info: bcrypt.compare(password, results.rows[0].password),
      kaocode: ":-)",
    });
    return;
  });
};

const updateUser = (req, res) => {
  const id = parseInt(req.params.id);

  const {
    firstname,
    middlename,
    lastname,
    code,
    contact,
    street,
    zip,
    city,
    country,
  } = req.body;

  const isValidated = validateUpdateData(
    [
      firstname,
      middlename,
      lastname,
      code,
      contact,
      street,
      zip,
      city,
      country,
    ],
    res
  );

  if (!isValidated) {
    return;
  }

  if (req.role === undefined) {
    console.log(req.role);
    res.status(401).send({
      message: "unauthorized",
      info: "attempting to access a function not intended for role.",
      kaocode: "( •̀ - •́ )",
    });
    return;
  }

  pool.query(
    queries.updateUser,
    [
      firstname,
      middlename,
      lastname,
      code,
      contact,
      street,
      zip,
      city,
      country,
      id,
    ],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json({
          message: "Internal server error",
          info: "get users failed",
          kaocode: ":-(",
        });
        return;
      }

      delete results.rows[0].password;

      res.status(200).json({
        message: "success",
        info: "Updated successfully!",
        kaocode: ":-)",
        user: {
          ...results.rows[0],
        },
        token: jwt.generateToken({
          username: results.rows[0].username,
          role: results.rows[0].role,
        }),
      });
    }
  );
};

const uploadUserPhoto = (req, res) => {
  const image = req.file;

  const { id, old } = req.query;

  if (old) {
    cloudinary.deleteImage(old);
  }

  cloudinary
    .uploadImage(image)
    .then((link) => {
      pool.query(queries.updateUserImage, [link, id], (error, results) => {
        if (error) {
          console.log(error);
          res.status(500).json({
            message: "Internal server error",
            info: "Upload failed",
            kaocode: ":-(",
          });
          return;
        }

        res.status(201).json({
          message: "success",
          info: "Image successfully uploaded",
          image: link,
          kaocode: ":-)",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: "Internal server error",
        info: "Upload failed",
        kaocode: ":-(",
      });
      return;
    });

  return;
};

const validateUpdateData = (data, res) => {
  const arrayValidation = [
    validator.validate(data[0], validator.INFO.NAME), // firstname
    validator.validate(data[1], validator.INFO.OPTIONAL_NAME), // middlename
    validator.validate(data[2], validator.INFO.NAME), // lastname
    validator.validate(data[3] + data[4], validator.INFO.CONTACT), // code + contact
    validator.validate(data[5], validator.INFO.TEXT_L50_ONLY), // street
    validator.validate(data[6], validator.INFO.TEXT_NUMERIC_ONLY), // zip
    validator.validate(data[7], validator.INFO.TEXT_L50_ONLY), // city
    validator.validate(data[8], validator.INFO.TEXT_L50_ONLY), // country
  ];

  for (let i = 0; i < arrayValidation.length; i++) {
    if (!arrayValidation[i][0]) {
      res.status(400).json({
        message: "bad request",
        info:
          i !== 10
            ? arrayValidation[i][1](`input '${data[i]}'`)
            : arrayValidation[i][1](`input password`),
        kaocode: ":-(",
      });
      return false;
    }
  }
  return true;
};

const validateUser = (data, res) => {
  const arrayValidation = [
    validator.validate(data[0], validator.INFO.USERNAME), // username
    validator.validate(data[1], validator.INFO.NAME), // firstname
    validator.validate(data[2], validator.INFO.OPTIONAL_NAME), // middlename
    validator.validate(data[3], validator.INFO.NAME), // lastname
    validator.validate(data[4] + data[5], validator.INFO.CONTACT), // code + contact
    validator.validate(data[6], validator.INFO.EMAIL), // email address
    validator.validate(data[7], validator.INFO.TEXT_L50_ONLY), // street
    validator.validate(data[8], validator.INFO.TEXT_NUMERIC_ONLY), // zip
    validator.validate(data[9], validator.INFO.TEXT_L50_ONLY), // city
    validator.validate(data[10], validator.INFO.TEXT_L50_ONLY), // country
    validator.validate(data[11], validator.INFO.PASSWORD), // password
  ];

  for (let i = 0; i < arrayValidation.length; i++) {
    if (!arrayValidation[i][0]) {
      res.status(400).json({
        message: "bad request",
        info:
          i !== 10
            ? arrayValidation[i][1](`input '${data[i]}'`)
            : arrayValidation[i][1](`input password`),
        kaocode: ":-(",
      });
      return false;
    }
  }
  return true;
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
  getUsers,
  getUserByID,
  addUser,
  deleteUser,
  updateUser,
  loginUser,
  verifyPassword,
  uploadUserPhoto,
};
