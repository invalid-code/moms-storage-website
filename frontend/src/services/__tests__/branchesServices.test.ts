import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http } from '@/helper/requestHelper';
import { branchService } from '@/services/branchesServices';

vi.mock('@/helper/requestHelper', () => ({ http: vi.fn() }));

const httpMock = vi.mocked(http);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('branchService', () => {
  it('getBranches calls GET /branch', async () => {
    httpMock.mockResolvedValue({ success: true, data: [] });

    await branchService.getBranches();

    expect(httpMock).toHaveBeenCalledWith('/branch', { method: 'GET' });
  });

  it('getBranchesLowestStock calls GET /branch/lowest-stock', async () => {
    await branchService.getBranchesLowestStock();

    expect(httpMock).toHaveBeenCalledWith('/branch/lowest-stock', { method: 'GET' });
  });

  it('getBranch builds the query string and blanks null stockQuantity', async () => {
    await branchService.getBranch('b1', 2, 10, 'para', null);

    expect(httpMock).toHaveBeenCalledWith('/branch/b1?page=2&limit=10&stockName=para&stockQuantity=', {
      method: 'GET',
    });
  });

  it('getBranch includes a numeric stockQuantity', async () => {
    await branchService.getBranch('b1', 1, 10, '', 30);

    expect(httpMock).toHaveBeenCalledWith('/branch/b1?page=1&limit=10&stockName=&stockQuantity=30', {
      method: 'GET',
    });
  });

  it('getBranchStock calls the nested stock route', async () => {
    await branchService.getBranchStock('b1', 's1');

    expect(httpMock).toHaveBeenCalledWith('/branch/b1/stock/s1', { method: 'GET' });
  });

  it('getBranchLowestStocks calls the lowest-stock route with pagination', async () => {
    await branchService.getBranchLowestStocks('b1', 1, 4);

    expect(httpMock).toHaveBeenCalledWith('/branch/b1/lowest-stock?page=1&limit=4', { method: 'GET' });
  });
});
