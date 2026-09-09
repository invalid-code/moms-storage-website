import fs from 'node:fs';
import path from 'node:path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

// File output env vars:
//   LOG_DIR             directory for daily log files (default: ./logs, "" disables file logging)
//   LOG_RETENTION_DAYS  dated log files older than this many days are pruned (default: 14)

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

const parseLevel = (value: string | undefined): LogLevel | undefined => {
  if (value === 'debug' || value === 'info' || value === 'warn' || value === 'error' || value === 'silent') {
    return value;
  }
  return undefined;
};

const defaultLevel = (): LogLevel => parseLevel(process.env.LOG_LEVEL) ?? (process.env.NODE_ENV === 'test' ? 'silent' : 'info');

let currentLevel: LogLevel = defaultLevel();

export const setLogLevel = (level: LogLevel): void => {
  currentLevel = level;
};

export const getLogLevel = (): LogLevel => currentLevel;

const format = (level: LogLevel, message: string, meta?: unknown): string => {
  const base = `${new Date().toISOString()} ${level.toUpperCase()} ${message}`;
  return meta === undefined ? `${base}\n` : `${base} ${JSON.stringify(meta)}\n`;
};

const LOG_FILE_PATTERN = /^(\d{4}-\d{2}-\d{2})\.log$/;
const DAY_MS = 24 * 60 * 60 * 1000;

let preparedDay = '';
let fileBroken = false;

const retentionDays = (): number => {
  const parsed = Number(process.env.LOG_RETENTION_DAYS ?? 14);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 14;
};

// Delete dated log files older than the retention window. Files that don't
// match the daily naming pattern are never touched.
const pruneOldLogs = (dir: string, today: string): void => {
  const cutoff = new Date(`${today}T00:00:00.000Z`).getTime() - retentionDays() * DAY_MS;
  for (const entry of fs.readdirSync(dir)) {
    const match = LOG_FILE_PATTERN.exec(entry);
    if (!match?.[1]) continue;
    if (new Date(`${match[1]}T00:00:00.000Z`).getTime() < cutoff) {
      fs.unlinkSync(path.join(dir, entry));
    }
  }
};

const appendToFile = (line: string, today: string): void => {
  if (fileBroken || process.env.LOG_DIR === '') return;
  try {
    const dir = process.env.LOG_DIR ?? path.join(process.cwd(), 'logs');
    if (preparedDay !== today) {
      fs.mkdirSync(dir, { recursive: true });
      pruneOldLogs(dir, today);
      preparedDay = today;
    }
    fs.appendFileSync(path.join(dir, `${today}.log`), line);
  } catch {
    // Logging must never crash the app (e.g. read-only filesystem in a
    // container without a mounted log volume). Fall back to console only.
    if (!fileBroken) {
      fileBroken = true;
      process.stderr.write('Logger: file output disabled (cannot write log directory)\n');
    }
  }
};

const write = (level: Exclude<LogLevel, 'silent'>, message: string, meta?: unknown): void => {
  if (LEVEL_ORDER[currentLevel] > LEVEL_ORDER[level]) return;
  const line = format(level, message, meta);
  // Errors go to stderr so container runtimes surface them separately.
  const stream = level === 'error' || level === 'warn' ? process.stderr : process.stdout;
  stream.write(line);
  appendToFile(line, line.slice(0, 10));
};

export const logger = {
  debug: (message: string, meta?: unknown): void => write('debug', message, meta),
  info: (message: string, meta?: unknown): void => write('info', message, meta),
  warn: (message: string, meta?: unknown): void => write('warn', message, meta),
  error: (message: string, meta?: unknown): void => write('error', message, meta),
};
