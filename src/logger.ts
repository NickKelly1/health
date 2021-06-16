import 'winston-daily-rotate-file';
import { Writable } from 'stream';
import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { DIR_ROOT } from './dir';
import { Config } from './config';
import { prettyQ } from './utils/pretty';


export const logger = winston.createLogger({
  exitOnError: false,
});

const colorFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.align(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...args } = info;
    const ts = timestamp.slice(0, 19).replace('T', ' ') ;
    return `${timestamp} [${level}]: ${message} ${Object.keys(args).length ? prettyQ(args) : ''}`.trim();
  }),
)

const consoleTransport = new winston.transports.Console({
  level: 'debug',
  handleExceptions: true,
  format: colorFormat,
});

logger.add(consoleTransport);
let isSetup = false;

let removableTransports: winston.transport[] = [];

/**
 * Teardown the logger
 */
export function teardownLogger() {
  if (!isSetup) return;
  isSetup = false;
  removableTransports.forEach(transport => logger.remove(transport));
  removableTransports = [];

  consoleTransport.silent = false;
}

/**
 * Initialise the logger with the config
 *
 * @param config
 */
export function setupLogger(config: Config, silent?: boolean) {
  if (isSetup) return;
  isSetup = true;

  if (silent) consoleTransport.silent = true;

  // create log directory if not exist
  const logDirectory = path.join(DIR_ROOT, config.LOG_DIR);
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
    if (!fs.existsSync(logDirectory)) {
      throw new Error(`Failed to create logDirectory: ${logDirectory}`);
    }
  }

  const nocolorFormat = winston.format.combine(
    winston.format.uncolorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.align(),
    winston.format.printf((info) => {
      const { timestamp, level, message, ...args } = info;
      return `${timestamp} [${level}]: ${message} ${Object.keys(args).length ? prettyQ(args) : ''}`.trim();
    }),
  )

  // https://www.npmjs.com/package/winston-daily-rotate-file
  const rotateTransportLog = new winston.transports.DailyRotateFile({
    level: 'debug',
    dirname: logDirectory,
    filename: '%DATE%.info.log',
    datePattern: 'YYYY-MM-DD',
    // datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: false,
    format: nocolorFormat,
    maxSize: config.LOG_MAX_SIZE,
    maxFiles: config.LOG_ROTATION_MAX_AGE,
  });

  const rotateTransportError = new winston.transports.DailyRotateFile({
    level: 'warn',
    dirname: logDirectory,
    filename: '%DATE%.error.log',
    datePattern: 'YYYY-MM-DD',
    // datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: false,
    format: nocolorFormat,
    maxSize: config.LOG_MAX_SIZE,
    maxFiles: config.LOG_ROTATION_MAX_AGE,
  });

  logger.add(rotateTransportLog);
  logger.add(rotateTransportError);
  removableTransports.push(rotateTransportLog);
  removableTransports.push(rotateTransportError);
}


function clean(str: string) { return str.trim().replace(/\n+%/, '').trim() }

export const loggerStream = new Writable({
  write(chunk: string | Buffer, encoding, done) {
    if (Buffer.isBuffer(chunk)) {
      // strip off morgan new lines...
      logger.info(clean(chunk.toString('utf-8')));
      return void done();
    }
    else if (typeof chunk === 'string') {
      logger.info(clean(chunk));
      return void done();
    }
    else {
      // ?
      logger.info(chunk)
      return void done();
    }
  },
});
