import { ErrorRequestHandler } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { z } from "zod";
import { BaseError } from "../domain/errors/BaseError";
import { ERROR_MESSAGES } from "../constants/ErrorMessages";
import { HTTP_STATUS_CODES } from "../constants/HttpStatusCode";

/**
 * Global Error Handler Middleware
 * Uses type narrowing (instanceof) to return appropriate status codes and messages.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // 1. Handle Domain/Application Errors (BaseError hierarchy)
  if (err instanceof BaseError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // 2. Handle JWT Library Errors specifically (True Type Narrowing)
  if (err instanceof TokenExpiredError) {
    res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      message: "Session expired. Please login again.",
    });
    return;
  }

  if (err instanceof JsonWebTokenError) {
    res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      message: "Invalid session token.",
    });
    return;
  }

  // 3. Handle Validation Errors (Zod)
  if (err instanceof z.ZodError) {
    res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: "Validation failed",
      errors: err.issues,
    });
    return;
  }

  // 4. Fallback for unexpected or programming errors
  console.error("Unexpected error:", err);

  res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
  });
};

