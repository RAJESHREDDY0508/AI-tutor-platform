export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational = true;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
export class NotFoundError extends AppError { constructor(m = 'Not found') { super(m, 404); } }
export class BadRequestError extends AppError { constructor(m = 'Bad request') { super(m, 400); } }
