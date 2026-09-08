import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http } from '@/helper/requestHelper';
import { deliveryService } from '@/services/deliveriesServices';

vi.mock('@/helper/requestHelper', () => ({ http: vi.fn() }));

const httpMock = vi.mocked(http);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('deliveryService', () => {
  it('getDeliveries builds the paginated query string', async () => {
    await deliveryService.getDeliveries(1, 10, 'b1');

    expect(httpMock).toHaveBeenCalledWith('/delivery?page=1&limit=10&branchId=b1', { method: 'GET' });
  });

  it('getDelivery calls GET /delivery/:id', async () => {
    await deliveryService.getDelivery('d1');

    expect(httpMock).toHaveBeenCalledWith('/delivery/d1', { method: 'GET' });
  });

  it('createDelivery POSTs the JSON body', async () => {
    const data = { branchId: 'b1', stocksRequested: ['s1', 's2'] };

    await deliveryService.createDelivery(data);

    expect(httpMock).toHaveBeenCalledWith('/delivery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  });

  it('patchDelivery PATCHes the JSON body', async () => {
    const data = { delivered: true, dateDelivered: '2026-01-15T00:00:00.000Z', stocksReceived: [] };

    await deliveryService.patchDelivery('d1', data);

    expect(httpMock).toHaveBeenCalledWith('/delivery/d1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  });
});
