const colors = {
  bold: (t) => `\x1b[1m${t}\x1b[0m`,
  red: (t) => `\x1b[31m${t}\x1b[0m`,
  yellow: (t) => `\x1b[33m${t}\x1b[0m`,
  cyan: (t) => `\x1b[36m${t}\x1b[0m`,
  magenta: (t) => `\x1b[35m${t}\x1b[0m`,
};

function errorHandler(err, req, res, next) {
  console.error(
    `${colors.red("❌")} ${colors.magenta(req.method)} ${colors.cyan(req.originalUrl)} → ${colors.red(
      err.message
    )}`
  );

  let statusCode = err.statusCode || 500;
  let message = err.message || "Server error, please try again later";

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `An account with this ${field} already exists`;
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(". ");
  }

  res.status(statusCode).json({ success: false, message });
}

module.exports = errorHandler;
