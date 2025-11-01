import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
const { combine, timestamp, label, printf, } = winston.format;
import * as path from 'path';

const rootDir = process.cwd();
const outputDir = path.join(rootDir, 'src', 'output', 'logs');

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const infoTranspost: DailyRotateFile = new DailyRotateFile({
  filename: 'info-%DATE%.log',
  dirname: outputDir,
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  level: 'info',
  frequency: '1d',
});

const errorTransport: DailyRotateFile = new DailyRotateFile({
  filename: 'error-%DATE%.log',
  dirname: outputDir,
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  level: 'error',
  frequency: '1d',
});

const warnTransport: DailyRotateFile = new DailyRotateFile({
  filename: 'warn-%DATE%.log',
  dirname: outputDir,
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  level: 'warn',
  frequency: '1d',
});

infoTranspost.on('error', (err) => {
  console.error('Info transport failed', err);
  wLogger().add(new winston.transports.Console());
});

errorTransport.on('error', (err) => {
  console.error('error transport failed', err);
  wLogger().add(new winston.transports.Console());
});

warnTransport.on('error', (err) => {
  console.error('warn transport failed', err);
  wLogger().add(new winston.transports.Console());
});

export const wLogger = () => {
  return winston.createLogger({
    level: 'error',
    format: combine(label({ label: 'Meditrack' }), timestamp(), myFormat),
    transports: [infoTranspost, errorTransport, warnTransport],
  });
};