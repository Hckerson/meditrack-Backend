import {
  Injectable,
  LoggerService,
  ConsoleLogger,
} from '@nestjs/common';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';

/**
 * Custom logger to store login in files apart from the output to stderr
 * @method
 */
@Injectable()
export class CustomLogger extends ConsoleLogger implements LoggerService {
  constructor() {
    super(CustomLogger.name, {
      timestamp: true,
    });
  }
  /**
   * Write a 'log' level log.
   */
  log(message: any, ...optionalParams: any[]) {
    
  }
  /**
   * Write an 'error' level log.
   */
  error(message: any, ...optionalParams: any[]) {

  }
  /**
   * Write a 'warn' level log.
   */
  warn(message: any, ...optionalParams: any[]) {

  }
  /**
   * Write a 'debug' level log.
   */
  debug(message: any, ...optionalParams: any[]) {

  }
  /**
   * Write a 'verbose' level log.
   */
  verbose(message: any, ...optionalParams: any[]) {

  }
  /**
   * Write a 'fatal' level log.
   */
  fatal(message: any, ...optionalParams: any[]) {

  }
}
