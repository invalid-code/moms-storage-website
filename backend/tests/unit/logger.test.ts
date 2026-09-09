import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getLogLevel, logger, setLogLevel } from '../../src/utils/logger.js';

let stdoutWrite: ReturnType<typeof vi.spyOn>;
let stderrWrite: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  stdoutWrite = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  stderrWrite = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  // Keep file output out of the repo: point it at a temp dir per test.
  vi.stubEnv('LOG_DIR', fs.mkdtempSync(path.join(os.tmpdir(), 'moms-logs-')));
  setLogLevel('debug');
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  setLogLevel('silent');
});

describe('logger levels', () => {
  it('emits info to stdout with timestamp, level, and message', () => {
    logger.info('hello');

    expect(stdoutWrite).toHaveBeenCalledOnce();
    const line = stdoutWrite.mock.calls[0]?.[0] as string;
    expect(line).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z INFO hello\n$/);
    expect(stderrWrite).not.toHaveBeenCalled();
  });

  it('appends metadata as JSON', () => {
    logger.info('sale created', { total: 50 });

    const line = stdoutWrite.mock.calls[0]?.[0] as string;
    expect(line).toContain('INFO sale created {"total":50}');
  });

  it('sends warn and error to stderr', () => {
    logger.warn('slow query');
    logger.error('db down');

    expect(stdoutWrite).not.toHaveBeenCalled();
    expect(stderrWrite).toHaveBeenCalledTimes(2);
    expect(stderrWrite.mock.calls[0]?.[0]).toContain('WARN slow query');
    expect(stderrWrite.mock.calls[1]?.[0]).toContain('ERROR db down');
  });

  it('suppresses messages below the current level', () => {
    setLogLevel('warn');

    logger.debug('nope');
    logger.info('nope');

    expect(stdoutWrite).not.toHaveBeenCalled();
    expect(stderrWrite).not.toHaveBeenCalled();
  });

  it('suppresses everything at silent level', () => {
    setLogLevel('silent');

    logger.debug('a');
    logger.info('b');
    logger.warn('c');
    logger.error('d');

    expect(stdoutWrite).not.toHaveBeenCalled();
    expect(stderrWrite).not.toHaveBeenCalled();
  });

  it('exposes the current level', () => {
    setLogLevel('error');

    expect(getLogLevel()).toBe('error');
  });
});

describe('logger defaults', () => {
  it('honours LOG_LEVEL from the environment', async () => {
    vi.resetModules();
    vi.stubEnv('LOG_LEVEL', 'error');

    const fresh = await import('../../src/utils/logger.js');

    expect(fresh.getLogLevel()).toBe('error');

    vi.unstubAllEnvs();
  });

  it('ignores an invalid LOG_LEVEL', async () => {
    vi.resetModules();
    vi.stubEnv('LOG_LEVEL', 'verbose');

    const fresh = await import('../../src/utils/logger.js');

    expect(fresh.getLogLevel()).toBe('silent');

    vi.unstubAllEnvs();
  });
});
