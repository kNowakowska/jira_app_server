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

const BoardNotUpdated = {
  reasonCode: "CANNOT_UPDATE_BOARD",
  message: "Edycja tablicy nie powiodło się.",
};

const BoardOrUserNotFound = {
  reasonCode: "BOARD_OR_USER_NOT_FOUND",
  message: "Nie odnaleziono tablicy lub użytkownika",
};

const BoardDeleted = {
  reasonCode: "BOARD_DELETED",
  message: "Tablica usunięta, nie można wykonać operacji",
};

const BoardNotDeleted = {
  reasonCode: "CANNOT_DELETE_BOARD",
  message: "Usuwanie tablicy nie powiodło się",
};

const BoardActionForbidden = {
  reasonCode: "BOARD_ACTION_FORBIDDEN",
  message: "Nie masz uprawnień do wykonania tej akcji.",
};

module.exports = {
  BoardNotCreated,
  BoardNotFound,
  NoReqUser,
  NoRequiredData,
  BoardOrUserNotFound,
  BoardNotUpdated,
  BoardDeleted,
  BoardNotDeleted,
  BoardActionForbidden,
};
