const NoRequiredData = {
  reasonCode: "NO_REQUIRED_DATA",
  message: "Brak wymaganych danych",
};

const LoginError = {
  message: "Invalid email or password!",
  reasonCode: "INVALID_EMAIL_OR_PASSWORD",
};

module.exports = { NoRequiredData, LoginError };
