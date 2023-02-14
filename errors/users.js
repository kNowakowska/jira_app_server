const UserNotFound = {
  reasonCode: "USER_NOT_FOUND",
  message: "Nie odnaleziono użytkownika",
};

const NoRequiredData = {
  reasonCode: "NO_REQUIRED_DATA",
  message: "Nie podano wszystkich wymaganych danych",
};

const UserExists = {
  reasonCode: "USER_ALREADY_EXISTS",
  message: "Użytkownik o podanym adresie e-mail już istnieje.",
};

const UserForbiddenAction = {
  reasonCode: "USER_FORBIDDEN_ACTION",
  message: "Brak uprawnień do wykonania tej operacji",
};

const UserUpdateError = {
  reasonCode: "USER_UPDATE_ERROR",
  message: "Edycja użytkownika nie powiodła się",
};

const UserNotCreated = {
  reasonCode: "USER_NOT_CREATED",
  message: "Utworzenie użytkownika nie powiodło się",
};

module.exports = {
  UserNotFound,
  NoRequiredData,
  UserExists,
  UserForbiddenAction,
  UserUpdateError,
  UserNotCreated,
};
