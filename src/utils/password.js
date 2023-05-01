const bcrypt = require("bcrypt");

/**
 * An asynchronous function that takes the plain text password and uses bcrypt to salt and hash the password.
 *
 * @param {String} plainTextPassword
 * @returns Hash - The salted and hashed version of the password.
 */
async function hash(plainTextPassword) {
  await bcrypt.hash(plainTextPassword, 10).then((res) => {
    return res;
  });
}

/**
 * An asynchronous function that takes the plain text password and hashed password and compares it using bcrypt.
 *
 * @param {*} plainTextPassword
 * @param {*} hash
 * @returns {boolean} result - whether the password matches
 */
async function compare(plainTextPassword, hash) {
  await bcrypt.compare(plainTextPassword, hash).then((res) => {
    return res;
  });
}

module.exports = {
  hash,
  compare,
};
