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

module.exports = { CannotAssignUser, TaskNotFound, NoRequiredData };
