const phoneUtil =
  require("google-libphonenumber").PhoneNumberUtil.getInstance();

const INFO = {
  PASSWORD: ["password", 8, 256],
  USERNAME: ["username", 3, 50],
  NAME: ["name", 1, 256],
  OPTIONAL_NAME: ["optional_name", 1, 256],
  OPTIONAL_TEXT_L20_ONLY: ["optional_text_l20", 1, 20],
  CONTACT: ["contact", 7, 15],
  EMAIL: ["email", 1, 256],
  TEXT_ONLY: ["text_only", 1, 256],
  TEXT_NUMERIC_ONLY: ["text_numeric", 1, 256],
  TEXT_L20_ONLY: ["text_l20", 1, 20],
  TEXT_L50_ONLY: ["text_l50", 1, 50],
  TEXT_L100_ONLY: ["text_l100", 1, 100],
  TEXT_L256_ONLY: ["text_l256", 1, 256],
  ALL_L256_ONLY: ["all_l256", 1, 256],
  ALL_L50_ONLY: ["all_l50", 1, 50],
  OPTIONAL_ALL_L20_ONLY: ["optional_all_l20", 1, 20],
};

const ERRORS = {
  TOO_LARGE: (info) => `${info} length is too large.`,
  TOO_SMALL: (info) => `${info} length is too small.`,
  LACKS_NUMBER: (info) => `${info} must contain at least 1 digit.`,
  LACKS_SPECIAL_CHAR: (info) =>
    `${info} must contain at least 1 special character.`,
  LACKS_CAPITAL_LETTER: (info) =>
    `${info} must contain at least 1 capital letter.`,
  LACKS_SMALL_LETTER: (info) => `${info} must contain at least 1 small letter.`,
  CONTAINS_INVALID_CHARS: (info) => `${info} contains invalid characters.`,
  CONTAINS_WHITESPACE: (info) => `${info} contains whitespace.`,
  NOINFO: (info) => `${info} is invalid.`,
};

const validate = (input, info) => {
  const isNonWhiteSpace = /^\S*$/;
  const isContainsUppercase = /^(?=.*[A-Z]).*$/;
  const isContainsLowercase = /^(?=.*[a-z]).*$/;
  const isContainsNumber = /^(?=.*[0-9]).*$/;
  const isContainsSymbol = /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/;
  const isValidEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  switch (info[0]) {
    case INFO.PASSWORD[0]:
      if (input.length < info[1]) {
        return [false, ERRORS.TOO_SMALL];
      }

      if (input.length > info[2]) {
        return [false, ERRORS.TOO_LARGE];
      }

      if (!isNonWhiteSpace.test(input)) {
        return [false, ERRORS.CONTAINS_WHITESPACE];
      }

      if (!isContainsLowercase.test(input)) {
        return [false, ERRORS.LACKS_SMALL_LETTER];
      }

      if (!isContainsUppercase.test(input)) {
        return [false, ERRORS.LACKS_CAPITAL_LETTER];
      }

      if (!isContainsNumber.test(input)) {
        return [false, ERRORS.LACKS_NUMBER];
      }

      if (!isContainsSymbol.test(input)) {
        return [false, ERRORS.LACKS_SPECIAL_CHAR];
      }
      break;
    case INFO.USERNAME[0]:
      if (input.length < info[1]) {
        return [false, ERRORS.TOO_SMALL];
      }

      if (input.length > info[2]) {
        return [false, ERRORS.TOO_LARGE];
      }

      if (isContainsSymbol.test(input)) {
        return [false, ERRORS.CONTAINS_INVALID_CHARS];
      }
      break;
    case INFO.NAME[0]:
      if (input.length < info[1]) {
        return [false, ERRORS.TOO_SMALL];
      }

      if (input.length > info[2]) {
        return [false, ERRORS.TOO_LARGE];
      }

      if (isContainsSymbol.test(input)) {
        return [false, ERRORS.CONTAINS_INVALID_CHARS];
      }

      if (isContainsNumber.test(input)) {
        return [false, ERRORS.CONTAINS_INVALID_CHARS];
      }
      break;
    case INFO.OPTIONAL_NAME[0]:
      if (input === "") {
        return [true];
      }

      if (input.length < info[1]) {
        return [false, ERRORS.TOO_SMALL];
      }

      if (input.length > info[2]) {
        return [false, ERRORS.TOO_LARGE];
      }

      if (isContainsSymbol.test(input)) {
        return [false, ERRORS.CONTAINS_INVALID_CHARS];
      }

      if (isContainsNumber.test(input)) {
        return [false, ERRORS.CONTAINS_INVALID_CHARS];
      }
      break;
    case INFO.OPTIONAL_TEXT_L20_ONLY:
      if (input === "") {
        return [true];
      }
      if (input.length < info[1]) {
        return [false, ERRORS.TOO_SMALL];
      }

      if (input.length > info[2]) {
        return [false, ERRORS.TOO_LARGE];
      }

      if (isContainsNumber.test(input) || isContainsSymbol.test(input)) {
        return [false, ERRORS.CONTAINS_INVALID_CHARS];
      }
      break;
    case INFO.CONTACT[0]:
      try {
        const number = phoneUtil.parse(input);
        return [phoneUtil.isValidNumber(number)];
      } catch (exception) {
        return [false, ERRORS.NOINFO];
      }
    case INFO.EMAIL[0]:
      if (!isValidEmail.test(input)) {
        return [false, ERRORS.NOINFO];
      }
      break;
    case INFO.OPTIONAL_ALL_L20_ONLY[0]:
      if (input === "") {
        return [true];
      }
      if (input.length < info[1]) {
        return [false, ERRORS.TOO_SMALL];
      }

      if (input.length > info[2]) {
        return [false, ERRORS.TOO_LARGE];
      }
      break;
    case INFO.ALL_L50_ONLY[0]:
      if (input.length < info[1]) {
        return [false, ERRORS.TOO_SMALL];
      }

      if (input.length > info[2]) {
        return [false, ERRORS.TOO_LARGE];
      }
      break;
    case INFO.ALL_L256_ONLY[0]:
      if (input.length < info[1]) {
        return [false, ERRORS.TOO_SMALL];
      }

      if (input.length > info[2]) {
        return [false, ERRORS.TOO_LARGE];
      }
      break;
    case INFO.TEXT_ONLY[0]:
      if (!isNonWhiteSpace.test(input)) {
        return [false, ERRORS.CONTAINS_WHITESPACE];
      }
      if (isContainsNumber.test(input) || isContainsSymbol.test(input)) {
        return [false, ERRORS.CONTAINS_INVALID_CHARS];
      }
      break;

    case INFO.TEXT_L20_ONLY[0]:
      if (input.length < info[1]) {
        return [false, ERRORS.TOO_SMALL];
      }

      if (input.length > info[2]) {
        return [false, ERRORS.TOO_LARGE];
      }

      if (isContainsNumber.test(input) || isContainsSymbol.test(input)) {
        return [false, ERRORS.CONTAINS_INVALID_CHARS];
      }
      break;

    case INFO.TEXT_L50_ONLY[0]:
      if (input.length < info[1]) {
        return [false, ERRORS.TOO_SMALL];
      }

      if (input.length > info[2]) {
        return [false, ERRORS.TOO_LARGE];
      }

      if (isContainsNumber.test(input) || isContainsSymbol.test(input)) {
        return [false, ERRORS.CONTAINS_INVALID_CHARS];
      }
      break;

    case INFO.TEXT_L100_ONLY[0]:
      if (input.length < info[1]) {
        return [false, ERRORS.TOO_SMALL];
      }

      if (input.length > info[2]) {
        return [false, ERRORS.TOO_LARGE];
      }

      if (isContainsNumber.test(input) || isContainsSymbol.test(input)) {
        return [false, ERRORS.CONTAINS_INVALID_CHARS];
      }
      break;
    case INFO.TEXT_L256_ONLY[0]:
      if (input.length < info[1]) {
        return [false, ERRORS.TOO_SMALL];
      }

      if (input.length > info[2]) {
        return [false, ERRORS.TOO_LARGE];
      }

      if (isContainsNumber.test(input) || isContainsSymbol.test(input)) {
        return [false, ERRORS.CONTAINS_INVALID_CHARS];
      }
      break;
    case INFO.TEXT_NUMERIC_ONLY[0]:
      if (input.length < info[1]) {
        return [false, ERRORS.TOO_SMALL];
      }
      if (!isNonWhiteSpace.test(input)) {
        return [false, ERRORS.CONTAINS_WHITESPACE];
      }
      if (isContainsSymbol.test(input)) {
        return [false, ERRORS.CONTAINS_INVALID_CHARS];
      }
      break;
    default:
      return [false, ERRORS.NOINFO];
  }

  return [true];
};

module.exports = {
  validate,
  INFO,
};
