// Resolve all dotenv variables
require("dotenv").config();

const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  return jwt.sign(
    {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
    },
    process.env.APP_SIGNATURE,
    {
      algorithm: "HS256",
      issuer: "damityarn",
      expiresIn: "7d",
      header: { alg: "HS256", typ: "JWT" },
    }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.APP_SIGNATURE, { issuer: "damityarn" });
};

module.exports = {
  generateToken,
  verifyToken,
};
