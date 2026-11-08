const { AppError } = require("../utils/AppError");

function envelope(code, message, field = null, debug, providerStatus, hint) {
  return {
    success: false,
    code,
    message,
    ...(field ? { field } : {}),
    ...(debug ? { debug } : {}),
    ...(Number.isInteger(providerStatus) ? { providerStatus } : {}),
    ...(hint ? { hint } : {}),
  };
}

function errorHandler(err, req, res, next) {
  void req;
  void next;

  if (err instanceof AppError || err.isOperational) {
    return res.status(err.statusCode || 500).json(
      envelope(
        err.code,
        err.message,
        err.field,
        undefined,
        process.env.NODE_ENV !== "production" ? err.providerStatus : undefined,
        process.env.NODE_ENV === "production" ? err.hint : undefined
      )
    );
  }

  if (err.name === "ZodError" || Array.isArray(err.issues)) {
    const issue = err.issues?.[0];
    return res
      .status(422)
      .json(envelope("VALIDATION_FAILED", issue?.message || "Validation failed", issue?.path?.join(".")));
  }

  if (err.name === "CastError") {
    return res
      .status(400)
      .json(envelope("INVALID_ID", "That link looks broken — the id in the URL isn't valid."));
  }

  if (err.name === "ValidationError") {
    const [field, detail] = Object.entries(err.errors || {})[0] || [null, null];
    return res
      .status(422)
      .json(envelope("VALIDATION_FAILED", detail?.message || "Validation failed", field));
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    if (field === "email") {
      return res
        .status(409)
        .json(
          envelope(
            "EMAIL_TAKEN",
            "An account with this email already exists. Try logging in instead.",
            "email"
          )
        );
    }
    return res.status(409).json(envelope("DUPLICATE_KEY", "That value already exists.", field));
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json(envelope("PAYLOAD_TOO_LARGE", "The request body is too large."));
  }

  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json(envelope("INVALID_JSON", "The request body contains invalid JSON."));
  }

  const databaseError =
    /buffering|MongoNetwork|MongoServerSelection/i.test(err.name || "") ||
    /buffering|MongoNetwork|MongoServerSelection/i.test(err.message || "");
  if (databaseError) {
    return res
      .status(503)
      .json(envelope("DB_UNAVAILABLE", "We can't reach the database right now. Please try again in a moment."));
  }

  if (Number.isInteger(err.statusCode) && err.statusCode >= 400 && err.statusCode <= 499) {
    const code = typeof err.code === "string" ? err.code : "REQUEST_FAILED";
    return res.status(err.statusCode).json(envelope(code, "The request could not be completed."));
  }

  console.error("Unhandled server error", err);
  return res
    .status(500)
    .json(
      envelope(
        "INTERNAL_ERROR",
        "Something broke on our side. Please try again.",
        null,
        process.env.NODE_ENV !== "production" ? err.message : undefined
      )
    );
}

module.exports = errorHandler;
