import { Injectable, LoggerService, ConsoleLogger } from '@nestjs/common';
import { wLogger } from 'src/services/winston/setup';
import { Logger } from 'winston';

/**
 * Custom logger to store login in files apart from the output to stderr
 * @method
 */
@Injectable()
export class CustomLogger extends ConsoleLogger implements LoggerService {
  private logger: Logger;
  constructor() {
    super(CustomLogger.name, {
      timestamp: true,
    });
    this.logger = wLogger();
  }
  /**
   * Write a 'log' level log.
   */
  log(message: any, ...optionalParams: any[]) {
    this.logger.info(message);
    super.log(message);
  }
  /**
   * Write an 'error' level log.
   */
  error(message: any, ...optionalParams: any[]) {
    this.logger.error(message);
    super.error(message);
  }
  /**
   * Write a 'warn' level log.
   */
  warn(message: any, ...optionalParams: any[]) {
    this.logger.error(message);
    super.warn(message);
  }
  /**
   * Write a 'debug' level log.
   */
  debug(message: any, ...optionalParams: any[]) {
    this.logger.error(message);
    super.debug(message);
  }
  /**
   * Write a 'verbose' level log.
   */
  verbose(message: any, ...optionalParams: any[]) {
    this.logger.error(message);
    super.verbose(message);
  }
  /**
   * Write a 'fatal' level log.
   */
  fatal(message: any, ...optionalParams: any[]) {
    this.logger.error(message);
    super.fatal(message);
  }
}
