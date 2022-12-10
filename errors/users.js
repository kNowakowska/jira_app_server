const UserNotFound = {
  reasonCode: "USER_NOT_FOUND",
  message: "Nie odnaleziono użytkownika",
};

const NoRequiredData = {
  reasonCode: "NOT_REQUIRED_DATA",
  message: "Nie podano wszystkich wymaganych danych",
};

const UserExists = {
  reasonCode: "USER_ALREADY_EXISTS",
  message: "Użytkownik o podanym adresie e-mail już istnieje.",
};

module.exports = { UserNotFound, NoRequiredData, UserExists };
