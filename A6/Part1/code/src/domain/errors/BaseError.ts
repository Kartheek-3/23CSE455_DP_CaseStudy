import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";

export class BaseError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, isOperational: boolean = true) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Set the prototype explicitly to ensure instanceof works correctly
    Object.setPrototypeOf(this, new.target.prototype);
    
    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}
