import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http } from '@/helper/requestHelper';
import { saleService } from '@/services/salesServices';

vi.mock('@/helper/requestHelper', () => ({ http: vi.fn() }));

const httpMock = vi.mocked(http);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('saleService', () => {
  it('getSales builds the paginated query string', async () => {
    await saleService.getSales(1, 10, 'b1');

    expect(httpMock).toHaveBeenCalledWith('/sale?page=1&limit=10&branchId=b1', { method: 'GET' });
  });

  it('getSale calls GET /sale/:id', async () => {
    await saleService.getSale('s1');

    expect(httpMock).toHaveBeenCalledWith('/sale/s1', { method: 'GET' });
  });

  it('createSale POSTs the JSON body', async () => {
    const data = { branchId: 'b1', items: [{ stockId: 's1', quantity: 2 }] };

    await saleService.createSale(data);

    expect(httpMock).toHaveBeenCalledWith('/sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  });

  it('voidSale PATCHes the void route with no body', async () => {
    await saleService.voidSale('s1');

    expect(httpMock).toHaveBeenCalledWith('/sale/s1/void', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
  });
});
