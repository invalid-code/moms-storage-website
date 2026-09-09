import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { requestLogger } from '../../src/middlewares/requestLogger.js';
import { setLogLevel } from '../../src/utils/logger.js';

const buildApp = () => {
  const app = express();
  app.use(requestLogger);
  app.get('/ping', (_req, res) => {
    res.status(200).json({ success: true });
  });
  app.get('/boom', (_req, res) => {
    res.status(500).json({ success: false });
  });
  return app;
};

let stdoutWrite: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  stdoutWrite = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  // Keep file output out of the repo: point it at a temp dir.
  vi.stubEnv('LOG_DIR', fs.mkdtempSync(path.join(os.tmpdir(), 'moms-logs-')));
  setLogLevel('info');
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  setLogLevel('silent');
});

describe('requestLogger', () => {
  it('logs method, path, status, and duration when the response finishes', async () => {
    const res = await request(buildApp()).get('/ping');

    expect(res.status).toBe(200);
    expect(stdoutWrite).toHaveBeenCalledOnce();
    const line = stdoutWrite.mock.calls[0]?.[0] as string;
    expect(line).toMatch(/INFO GET \/ping 200 \d+ms/);
  });

  it('logs the actual status code for error responses', async () => {
    await request(buildApp()).get('/boom');

    const line = stdoutWrite.mock.calls[0]?.[0] as string;
    expect(line).toContain('GET /boom 500');
  });

  it('stays silent when the log level is silent', async () => {
    setLogLevel('silent');

    await request(buildApp()).get('/ping');

    expect(stdoutWrite).not.toHaveBeenCalled();
  });
});
