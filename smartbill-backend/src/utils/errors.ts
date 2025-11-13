export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors?: any) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409, "CONFLICT");
  }
}

/**
 * Handle Prisma errors and convert to AppError
 */
export function handlePrismaError(error: any): AppError {
  // P2002: Unique constraint violation
  if (error.code === "P2002") {
    return new ConflictError(
      `A record with this ${error.meta?.target?.[0] || "field"} already exists`
    );
  }

  // P2025: Record not found
  if (error.code === "P2025") {
    return new NotFoundError();
  }

  // P2003: Foreign key constraint violation
  if (error.code === "P2003") {
    return new ValidationError("Invalid reference to related resource");
  }

  return new AppError("Database error occurred", 500, "DATABASE_ERROR");
}

/**
 * Error response formatter
 */
export function formatErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        ...(error instanceof ValidationError && error.errors
          ? { errors: error.errors }
          : {}),
      },
    };
  }

  // Handle Zod validation errors
  if ((error as any)?.name === "ZodError") {
    const zodError = error as any;
    return {
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        statusCode: 400,
        errors: zodError.errors,
      },
    };
  }

  // Unknown errors
  console.error("Unhandled error:", error);
  return {
    error: {
      message: "Internal server error",
      code: "INTERNAL_ERROR",
      statusCode: 500,
    },
  };
}
