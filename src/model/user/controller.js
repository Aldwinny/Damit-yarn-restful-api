const pool = require("../../utils/db");
const queries = require("./queries");
const jwt = require("../../utils/token");

const validator = require("../../utils/validate");

const ROLES = { ADMIN: "admin", USER: "user" };

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
    res.status(400).json({
      message: "bad request",
      info: "user data incomplete",
      kaomoji: ":-(",
    });
    return;
  }

  let isValidAll = validateUser(userData, res);
  if (!isValidAll) return;

  // validate shop input
  if (hasShop) {
    if (shopData.some((item) => item === undefined)) {
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
      pool.query(
        queries.createUser,
        [
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
        ],
        (error, results) => {
          if (error) {
            res.status(500).json({
              message: "Internal server error",
              info: "insertion rejected by database",
              kaocode: ":-(",
            });
            return;
          }

          res.status(201).json({
            message: "User created successfully",
            kaocode: "(･ω･)b",
          });
        }
      );
      return;
    }

    pool.query(
      queries.createUser,
      [
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
      ],
      (error, results) => {
        if (error) {
          console.log(error);
          res.status(500).json({
            message: "Internal server error",
            info: "insertion rejected by database",
            kaocode: ":-(",
          });
          return;
        }

        console.log(results.rows[0]);

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
      }
    );
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

    // TODO: WEAK TESTING, USE BCRYPT
    if (results.rows[0].password === userData[1]) {
      // this doesn't feel right but ok
      delete results.rows[0].password;

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

const updateUser = (req, res) => {
  const id = parseInt(req.params.id);

  res.status(501).json({
    message: "not implemented",
    info: "TODO: implement",
  });
};

const validateUser = (data, res) => {
  const arrayValidation = [
    validator.validate(data[0], validator.INFO.USERNAME), // username
    validator.validate(data[1], validator.INFO.NAME), // firstname
    validator.validate(data[2], validator.INFO.OPTIONAL_NAME), // middlename
    validator.validate(data[3], validator.INFO.NAME), // lastname
    validator.validate(data[4] + data[5], validator.INFO.CONTACT), // code + contact
    validator.validate(data[6], validator.INFO.EMAIL), // email address
    validator.validate(data[7], validator.INFO.TEXT_ONLY), // street
    validator.validate(data[8], validator.INFO.TEXT_NUMERIC_ONLY), // zip
    validator.validate(data[9], validator.INFO.TEXT_ONLY), // city
    validator.validate(data[10], validator.INFO.TEXT_ONLY), // country
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
};
