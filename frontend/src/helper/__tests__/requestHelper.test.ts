import { afterEach, describe, expect, it, vi } from 'vitest';
import { http } from '@/helper/requestHelper';

afterEach(() => {
  vi.unstubAllGlobals();
});

const jsonResponse = (payload: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    json: () => Promise.resolve(payload),
  }) as Response;

describe('http', () => {
  it('prefixes the path with VITE_API_URL and returns the parsed body', async () => {
    const payload = { success: true, data: [1, 2] };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(payload));
    vi.stubGlobal('fetch', fetchMock);

    const result = await http<typeof payload>('/branch', { method: 'GET' });

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [req] = fetchMock.mock.calls[0] as [Request];
    expect(req).toBeInstanceOf(Request);
    expect(req.url).toBe('https://api.test/branch');
    expect(req.method).toBe('GET');
  });

  it('forwards POST config including headers and body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ success: true }));
    vi.stubGlobal('fetch', fetchMock);

    await http('/delivery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branchId: 'b1' }),
    });

    const [req] = fetchMock.mock.calls[0] as [Request];
    expect(req.method).toBe('POST');
    expect(req.headers.get('Content-Type')).toBe('application/json');
    await expect(req.text()).resolves.toBe(JSON.stringify({ branchId: 'b1' }));
  });

  it('throws with the status when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, false, 404)));

    await expect(http('/branch', { method: 'GET' })).rejects.toThrow('HTTP error! status: 404');
  });
});
