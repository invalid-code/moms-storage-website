import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const freshLogger = async (env: Record<string, string>) => {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) {
    vi.stubEnv(key, value);
  }
  return import('../../src/utils/logger.js');
};

const todayStamp = () => new Date().toISOString().slice(0, 10);

let stdoutWrite: ReturnType<typeof vi.spyOn>;
let stderrWrite: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  stdoutWrite = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  stderrWrite = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe('logger file output', () => {
  it('tees lines into a daily file inside LOG_DIR', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'moms-logs-'));
    const { logger, setLogLevel } = await freshLogger({ LOG_DIR: dir });
    setLogLevel('info');

    logger.info('sale created', { total: 50 });

    const consoleLine = stdoutWrite.mock.calls[0]?.[0] as string;
    const fileContent = fs.readFileSync(path.join(dir, `${todayStamp()}.log`), 'utf8');
    expect(fileContent).toBe(consoleLine);
    expect(fileContent).toContain('INFO sale created {"total":50}');
  });

  it('creates nested log directories automatically', async () => {
    const dir = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'moms-logs-')), 'nested', 'logs');
    const { logger, setLogLevel } = await freshLogger({ LOG_DIR: dir });
    setLogLevel('info');

    logger.info('hello');

    expect(fs.readFileSync(path.join(dir, `${todayStamp()}.log`), 'utf8')).toContain('INFO hello');
  });

  it('disables file output when LOG_DIR is empty', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'moms-logs-'));
    const { logger, setLogLevel } = await freshLogger({ LOG_DIR: '' });
    setLogLevel('info');

    logger.info('hello');

    expect(fs.readdirSync(dir)).toEqual([]);
    expect(stdoutWrite).toHaveBeenCalledOnce();
  });

  it('falls back to console-only when the directory cannot be written', async () => {
    const blocker = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'moms-logs-')), 'blocker');
    fs.writeFileSync(blocker, 'not a directory');
    const { logger, setLogLevel } = await freshLogger({ LOG_DIR: path.join(blocker, 'logs') });
    setLogLevel('info');

    expect(() => {
      logger.info('first');
      logger.info('second');
    }).not.toThrow();

    expect(stdoutWrite).toHaveBeenCalledTimes(2);
    const warnings = stderrWrite.mock.calls.filter((args: unknown[]) =>
      String(args[0]).includes('file output disabled'),
    );
    expect(warnings).toHaveLength(1);
  });

  it('prunes dated files beyond LOG_RETENTION_DAYS and keeps the rest', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'moms-logs-'));
    const todayFile = path.join(dir, `${todayStamp()}.log`);
    fs.writeFileSync(path.join(dir, '2000-01-01.log'), 'ancient\n');
    fs.writeFileSync(todayFile, 'earlier\n');
    fs.writeFileSync(path.join(dir, 'notes.txt'), 'keep me\n');
    const { logger, setLogLevel } = await freshLogger({ LOG_DIR: dir, LOG_RETENTION_DAYS: '7' });
    setLogLevel('info');

    logger.info('fresh');

    expect(fs.existsSync(path.join(dir, '2000-01-01.log'))).toBe(false);
    const todayContent = fs.readFileSync(todayFile, 'utf8');
    expect(todayContent.startsWith('earlier\n')).toBe(true);
    expect(todayContent).toContain('INFO fresh');
    expect(fs.readFileSync(path.join(dir, 'notes.txt'), 'utf8')).toBe('keep me\n');
  });

  it('rolls over to a new file when the day changes', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'moms-logs-'));
    const { logger, setLogLevel } = await freshLogger({ LOG_DIR: dir });
    setLogLevel('info');

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01T12:00:00.000Z'));
    logger.info('day one');
    vi.setSystemTime(new Date('2026-03-02T12:00:00.000Z'));
    logger.info('day two');

    expect(fs.readFileSync(path.join(dir, '2026-03-01.log'), 'utf8')).toContain('day one');
    expect(fs.readFileSync(path.join(dir, '2026-03-01.log'), 'utf8')).not.toContain('day two');
    expect(fs.readFileSync(path.join(dir, '2026-03-02.log'), 'utf8')).toContain('day two');
  });
});
