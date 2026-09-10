import { fail } from "../utils/response.js";

export function notFoundHandler(req, res) {
  return fail(res, 404, `Route ${req.originalUrl} not found`, "NOT_FOUND");
}

export function errorHandler(err, req, res, _next) {
  console.error("Unhandled Error:", err);
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Something went wrong";
  const error = err.code || "SERVER_ERROR";
  return fail(res, status, message, error);
}
