import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { isStorageError } from "../types/error";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, "AUTH_ERROR", 401);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, "FORBIDDEN", 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, "CONFLICT", 409);
    this.name = "ConflictError";
  }
}

export function handleError(error: unknown, c: Context): Response {
  console.error("Error:", error);

  if (error instanceof AppError) {
    return c.json({
      error: error.code,
      error_description: error.message,
      details: error.details,
    }); // TODO: set status
  }

  if (error instanceof HTTPException) {
    return c.json(
      {
        error: "HTTP_ERROR",
        error_description: error.message,
      },
      error.status,
    );
  }

  if (isStorageError(error)) {
    return c.json({
      error: "STORAGE_ERROR",
      error_description: error.message,
    });
  }

  return c.json(
    {
      error: "INTERNAL_ERROR",
      error_description: "An unexpected error occurred",
    },
    500,
  );
}
