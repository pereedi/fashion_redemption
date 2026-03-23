import fs from 'fs';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logToFile = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = JSON.stringify({ timestamp, level, message, ...meta }) + '\n';
  fs.appendFileSync(path.join(logDir, `${level}.log`), logEntry);
};

export const logger = {
  info: (message, meta) => {
    console.log(`[INFO] ${message}`, meta || '');
    logToFile('info', message, meta);
  },
  error: (message, meta) => {
    console.error(`[ERROR] ${message}`, meta || '');
    logToFile('error', message, meta);
  },
  warn: (message, meta) => {
    console.warn(`[WARN] ${message}`, meta || '');
    logToFile('warn', message, meta);
  },
  db: (message, meta) => {
    console.log(`[DATABASE] ${message}`, meta || '');
    logToFile('database', message, meta);
  }
};
