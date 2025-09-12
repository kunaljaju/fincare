/**
 * Async error handler wrapper
 * Wraps async route handlers to catch and forward errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
