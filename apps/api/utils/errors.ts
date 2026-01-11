export class CustomError extends Error {
  statusCode: number;
  error?: any;

  constructor(statusCode: number, message?: string, error?: any) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.name = "CustomError";
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export class NotFoundError extends Error {
  statusCode: number;

  constructor(message?: string) {
    super(message);
    this.statusCode = 404;
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class BadRequestError extends Error {
  statusCode: number;

  constructor(message?: string) {
    super(message);
    this.statusCode = 400;
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class UnauthorizedError extends Error {
  statusCode: number;

  constructor(message?: string) {
    super(message);
    this.statusCode = 401;
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ServerError extends Error {
  statusCode: number;

  constructor(message?: string) {
    super(message);
    this.statusCode = 500;
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

export class ForbiddenError extends Error {
  statusCode: number;

  constructor(message?: string) {
    super(message);
    this.statusCode = 403;
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
