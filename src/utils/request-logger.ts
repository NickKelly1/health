import winston from "winston";

interface RequestLoggerOptions {
  prefix?: symbol | string | (() => string);
}

export class RequestLogger {
  constructor(
    protected readonly winston: winston.Logger,
    protected readonly options: RequestLoggerOptions = {},
  ) {
    //
  }

  protected buildMessage(message: string): string {
    switch (typeof this.options.prefix) {
      case 'undefined': return message;
      case 'string': return `${this.options.prefix}${message}`;
      case 'function': return `${this.options.prefix()}${message}`;
      case 'symbol': return `${String(this.options.prefix)}${message}`;
      default: return message;
    }
  }

  info(message: string, cb?: winston.LogCallback) {
    this.winston.info(this.buildMessage(message), cb);
  }

  debug(message: string, cb?: winston.LogCallback) {
    this.winston.debug(this.buildMessage(message), cb)
  }

  warn(message: string, cb?: winston.LogCallback) {
    this.winston.warn(this.buildMessage(message), cb)
  }

  error(message: string, cb?: winston.LogCallback) {
    this.winston.error(this.buildMessage(message), cb)
  }

  log(message: string, cb?: winston.LogCallback) {
    this.winston.log(this.buildMessage(message), cb)
  }
}