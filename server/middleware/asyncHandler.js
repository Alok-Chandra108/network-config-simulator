// server/middleware/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) => {
  // Promise.resolve ensures that if 'fn' is not an async function
  // (i.e., it doesn't return a Promise), it's still wrapped in one.
  // This allows .catch(next) to work universally for both sync and async errors.
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;