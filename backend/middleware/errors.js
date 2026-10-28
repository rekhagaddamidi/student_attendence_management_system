function notFound(req, res) {
  res.status(404).json({ error: "API endpoint not found." });
}
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  console.error(err.message || "Unexpected server error");
  res.status(err.status || 500).json({
    error: err.status && err.status < 500 ? err.message : "An unexpected server error occurred."
  });
}
module.exports = { notFound, errorHandler };
