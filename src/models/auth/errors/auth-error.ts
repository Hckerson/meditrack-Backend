import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthError extends HttpException {
  constructor(
    public readonly errorDescription: string,
    public readonly statusCode: HttpStatus,
  ) {
    super({ status: statusCode, error: errorDescription }, statusCode);
  }
}
