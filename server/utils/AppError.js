class AppError extends Error {
  constructor(code, statusCode, message, field = null) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.field = field;
    this.isOperational = true;
    Error.captureStackTrace?.(this, AppError);
  }

  toJSON() {
    return {
      success: false,
      code: this.code,
      message: this.message,
      ...(this.field ? { field: this.field } : {}),
    };
  }
}

const badRequest = (message, field = null) => new AppError("BAD_REQUEST", 400, message, field);
const unauthorized = (message, field = null) => new AppError("UNAUTHORIZED", 401, message, field);
const forbidden = (message, field = null) => new AppError("FORBIDDEN", 403, message, field);
const notFound = (message, field = null) => new AppError("NOT_FOUND", 404, message, field);
const conflict = (message, field = null) => new AppError("CONFLICT", 409, message, field);
const tooMany = (message, field = null) => new AppError("TOO_MANY_REQUESTS", 429, message, field);
const unavailable = (message, field = null) => new AppError("SERVICE_UNAVAILABLE", 503, message, field);

module.exports = {
  AppError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  tooMany,
  unavailable,
};
