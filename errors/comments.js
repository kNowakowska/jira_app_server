const CommentNotFound = {
  reasonCode: "COMMENT_NOT_FOUND",
  message: "Komentarz nie został odnaleziony",
};

const CommentNotCreated = {
  reasonCode: "COMMENT_NOT_CREATED",
  message: "Komentarz nie zostal utworzony",
};

const NoRequiredCommentData = {
  reasonCode: "NO_REQUIRED_DATA",
  message: "Nie podano wymaganych danych",
};

const ForbiddenAction = {
  reasonCode: "FORBIDDEN_ACTION",
  message: "Brak uprawnień do wykonania tej akcji.",
};

module.exports = {
  CommentNotCreated,
  CommentNotFound,
  NoRequiredCommentData,
  ForbiddenAction,
};
