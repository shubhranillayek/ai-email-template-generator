"use strict";

const { logError } = require("../utils/logger");

// all errors go out in one format: { success: false, error: "..." }
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) {
    logError(`${req.method} ${req.originalUrl} -> ${err.message}`);
  }
  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal server error.",
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, error: "Route not found." });
}

module.exports = { errorHandler, notFoundHandler };
