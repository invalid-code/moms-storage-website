import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http } from '@/helper/requestHelper';
import { medicineService } from '@/services/medicineServices';

vi.mock('@/helper/requestHelper', () => ({ http: vi.fn() }));

const httpMock = vi.mocked(http);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('medicineService', () => {
  it('getMedicineRecords builds the paginated query string', async () => {
    await medicineService.getMedicineRecords(2, 10, 'para');

    expect(httpMock).toHaveBeenCalledWith('/item?page=2&limit=10&stockName=para', { method: 'GET' });
  });

  it('getMedicineRecord calls GET /item/:id', async () => {
    await medicineService.getMedicineRecord('m1');

    expect(httpMock).toHaveBeenCalledWith('/item/m1', { method: 'GET' });
  });
});
