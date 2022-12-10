const BoardNotFound = {
  reasonCode: "BOARD_NOT_FOUND",
  message: "Nie odnaleziono tablicy o podanym id",
};

const NoReqUser = {
  reasonCode: "REQUEST_USER_NOT_FOUND",
  message: "Nie odnaleziono informacji o użytkowniku",
};

const NoRequiredData = {
  reasonCode: "NO_REQUIRED_DATA",
  message: "Nie podano wymaganych informacji",
};

const BoardNotCreated = {
  reasonCode: "CANNOT_CREATE_BOARD",
  message: "Utworzenie tablicy nie powiodło się.",
};

const BoardOrUserNotFound = {
  reasonCode: "BOARD_OR_USER_NOT_FOUND",
  message: "Nie odnaleziono tablicy lub użytkownika",
};

module.exports = {
  BoardNotCreated,
  BoardNotFound,
  NoReqUser,
  NoRequiredData,
  BoardOrUserNotFound,
};
