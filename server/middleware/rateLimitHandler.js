/*
  express-rate-limit returns plain text by default. The frontend expects the
  same JSON envelope as every other API error, including when the limit resets.
*/
function createRateLimitHandler({ code = "RATE_LIMITED", message }) {
  return (req, res) => {
    const resetTime = req.rateLimit?.resetTime;
    const validReset = resetTime instanceof Date && !Number.isNaN(resetTime.getTime());
    const retryAfter = validReset
      ? Math.max(0, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
      : undefined;

    return res.status(429).json({
      success: false,
      code,
      message,
      ...(validReset ? { resetsAt: resetTime.toISOString() } : {}),
      ...(retryAfter ? { retryAfter } : {}),
    });
  };
}

module.exports = { createRateLimitHandler };
