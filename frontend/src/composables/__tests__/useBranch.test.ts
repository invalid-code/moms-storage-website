import { beforeEach, describe, expect, it, vi } from 'vitest';
import { branchService } from '@/services/branchesServices';
import { useBranches } from '@/composables/useBranch';

vi.mock('@/services/branchesServices', () => ({
  branchService: {
    getBranches: vi.fn(),
    getBranchesLowestStock: vi.fn(),
    getBranch: vi.fn(),
    getBranchStock: vi.fn(),
    getBranchLowestStocks: vi.fn(),
  },
}));

const service = vi.mocked(branchService);

const pagination = {
  totalItems: 1,
  totalPages: 1,
  currentPage: 1,
  limit: 10,
  hasNextPage: false,
  hasPrevPage: false,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useBranches', () => {
  it('fetchBranches stores branches and clears loading/error', async () => {
    const branches = [{ _id: 'b1', name: 'Main', stocks: [] }];
    service.getBranches.mockResolvedValue({ success: true, data: branches });

    const { branches: state, isLoading, error, fetchBranches } = useBranches();
    const promise = fetchBranches();
    expect(isLoading.value).toBe(true);

    await promise;

    expect(state.value).toEqual(branches);
    expect(isLoading.value).toBe(false);
    expect(error.value).toBeNull();
  });

  it('fetchBranches stores the error message on failure', async () => {
    service.getBranches.mockRejectedValue(new Error('network down'));

    const { branches, error, fetchBranches } = useBranches();

    await fetchBranches();

    expect(branches.value).toEqual([]);
    expect(error.value).toBe('network down');
  });

  it('fetchBranches handles non-Error rejections', async () => {
    service.getBranches.mockRejectedValue('boom');

    const { error, fetchBranches } = useBranches();

    await fetchBranches();

    expect(error.value).toBe('An unexpected error occurred: boom');
  });

  it('fetchBranch stores stocks and pagination', async () => {
    const stocks = [{ 'stock-id': 's1', 'stock-name': 'Para', stock_onhold_amount: 2, percentage: 20 }];
    service.getBranch.mockResolvedValue({ success: true, data: stocks, pagination });

    const { branchStocks, pagination: state, fetchBranch } = useBranches();

    await fetchBranch('b1', 1, 10, '', null);

    expect(branchStocks.value).toEqual(stocks);
    expect(state.value).toEqual(pagination);
    expect(service.getBranch).toHaveBeenCalledWith('b1', 1, 10, '', null);
  });

  it('fetchBranch keeps previous pagination when the response omits it', async () => {
    service.getBranch.mockResolvedValue({ success: true, data: [] });

    const { pagination: state, fetchBranch } = useBranches();
    const before = { ...state.value };

    await fetchBranch('b1', 1, 10, '', null);

    expect(state.value).toEqual(before);
  });

  it('fetchBranchStock stores the single stock', async () => {
    const stock = { stock_name: 'Para', stock_id: 's1', stock_onhold_amount: 2 };
    service.getBranchStock.mockResolvedValue({ success: true, data: stock });

    const { branchStock, fetchBranchStock } = useBranches();

    await fetchBranchStock('b1', 's1');

    expect(branchStock.value).toEqual(stock);
  });

  it('fetchBranchesLowestStocks and fetchBranchLowestStocks store their lists', async () => {
    const lowest = [{ 'stock-name': 'A', branch: 'Main', 'stock-percentage': '10%' }];
    const branchLowest = [{ 'stock-name': 'A', stock_onhold_amount: 1 }];
    service.getBranchesLowestStock.mockResolvedValue({ success: true, data: lowest });
    service.getBranchLowestStocks.mockResolvedValue({ success: true, data: branchLowest, pagination });

    const { branchesLowestStocks, branchLowestStocks, fetchBranchesLowestStocks, fetchBranchLowestStocks } =
      useBranches();

    await fetchBranchesLowestStocks();
    await fetchBranchLowestStocks('b1', 1, 4);

    expect(branchesLowestStocks.value).toEqual(lowest);
    expect(branchLowestStocks.value).toEqual(branchLowest);
  });
});
