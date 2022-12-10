const CannotAssignUser = {
  reasonCode: "CANNOT_ASSIGN_USER",
  message: "Przypisanie użytkownika do zadania nie powiodło się.",
};

const TaskNotFound = {
  reasonCode: "TASK_NOT_FOUND",
  message: "Nie odnaleziono zadania",
};

const NoRequiredData = {
  reasonCode: "NO_REQUIRED_DATA",
  message: "Nie podano wymaganych danych",
};

const TaskDeleted = {
  reasonCode: "TASK_DELETED",
  message: "Zadanie usunięte bez możliwości edycji. ",
};

const TaskUpdateError = {
  reasonCode: "TASK_UPDATE_ERROR",
  message: "Modyfikacja zadania nie powiodła się. ",
};

const TaskForbiddenAction = {
  reasonCode: "TASK_FORBIDDEN_ACTION",
  message: "Brak uprawnień do wykonania tej akcji",
};

module.exports = {
  CannotAssignUser,
  TaskNotFound,
  NoRequiredData,
  TaskDeleted,
  TaskUpdateError,
  TaskForbiddenAction,
};
