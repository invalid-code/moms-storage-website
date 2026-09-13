import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import CreateSaleModal from '@/components/CreateSaleModal.vue';

interface MockMedicine {
  _id: string;
  name: string;
  count: number;
  price?: number;
}

const medicineApi = {
  pages: [] as MockMedicine[][],
  totalItems: 0,
};

const branchApi = {
  stocks: [] as { 'stock-id': string; 'stock-name': string; stock_onhold_amount: number; percentage: number }[],
};

vi.mock('@/services/medicineServices', () => ({
  medicineService: {
    getMedicineRecords: vi.fn(async (page: number) => ({
      success: true,
      data: medicineApi.pages[page - 1] ?? [],
      pagination: {
        totalItems: medicineApi.totalItems,
        totalPages: Math.ceil(medicineApi.totalItems / 10),
        currentPage: page,
        limit: 10,
        hasNextPage: page < Math.ceil(medicineApi.totalItems / 10),
        hasPrevPage: page > 1,
      },
    })),
    getMedicineRecord: vi.fn(),
  },
}));

vi.mock('@/services/branchesServices', () => ({
  branchService: {
    getBranches: vi.fn(),
    getBranchesLowestStock: vi.fn(),
    getBranch: vi.fn(async () => ({
      success: true,
      data: branchApi.stocks,
      pagination: {
        totalItems: branchApi.stocks.length,
        totalPages: 1,
        currentPage: 1,
        limit: 100,
        hasNextPage: false,
        hasPrevPage: false,
      },
    })),
    getBranchStock: vi.fn(),
    getBranchLowestStocks: vi.fn(),
  },
}));

vi.mock('@/services/salesServices', () => ({
  saleService: {
    getSales: vi.fn(),
    getSale: vi.fn(),
    createSale: vi.fn(),
    voidSale: vi.fn(),
  },
}));

import { medicineService } from '@/services/medicineServices';

const serveMedicinePages = (pages: MockMedicine[][], totalItems: number) => {
  medicineApi.pages = pages;
  medicineApi.totalItems = totalItems;
  vi.mocked(medicineService.getMedicineRecords).mockClear();
};

const flushLoads = async (expectedCalls?: number) => {
  // Sequential page loads are chained promises; wait for the expected number
  // of fetches instead of guessing a fixed number of ticks.
  if (expectedCalls !== undefined) {
    await vi.waitFor(() => {
      expect(vi.mocked(medicineService.getMedicineRecords).mock.calls.length).toBe(expectedCalls);
    });
  }
  await flushPromises();
};

describe('CreateSaleModal', () => {
  beforeEach(() => {
    branchApi.stocks = [];
    vi.mocked(medicineService.getMedicineRecords).mockClear();
  });
  it('renders medicine rows with prices and availability', async () => {
    serveMedicinePages(
      [[
        { _id: 'm1', name: 'Paracetamol', count: 100, price: 25 },
        { _id: 'm2', name: 'Ibuprofen', count: 50 },
      ]],
      2,
    );
    branchApi.stocks = [
      { 'stock-id': 'm1', 'stock-name': 'Paracetamol', stock_onhold_amount: 10, percentage: 10 },
    ];
    const wrapper = mount(CreateSaleModal, {
      props: { isOpen: true, branchId: 'b1' },
    });
    await flushLoads(1);

    expect(wrapper.text()).toContain('New Sale');
    expect(wrapper.text()).toContain('Paracetamol');
    expect(wrapper.text()).toContain('Ibuprofen');
    expect(wrapper.text()).toContain('10');
  });

  it('loads every page exactly once through the real paged composable', async () => {
    const makePage = (start: number, size: number): MockMedicine[] =>
      Array.from({ length: size }, (_, i) => ({
        _id: `m${start + i}`,
        name: `Med ${start + i}`,
        count: 100,
        price: 10,
      }));
    serveMedicinePages([makePage(1, 10), makePage(11, 10), makePage(21, 5)], 25);
    branchApi.stocks = [];
    const wrapper = mount(CreateSaleModal, {
      props: { isOpen: true, branchId: 'b1' },
    });
    await flushLoads(3);

    const requestedPages = vi.mocked(medicineService.getMedicineRecords).mock.calls.map(args => args[0]);
    expect(requestedPages).toEqual([1, 2, 3]);
    for (let i = 1; i <= 25; i += 1) {
      expect(wrapper.text()).toContain(`Med ${i}`);
    }
  });

  it('stops after one fetch when the catalogue is empty', async () => {
    serveMedicinePages([], 0);
    const wrapper = mount(CreateSaleModal, {
      props: { isOpen: true, branchId: 'b1' },
    });
    await flushLoads(1);
    // Give any runaway recursion a chance to fire a second fetch.
    await flushPromises();

    const requestedPages = vi.mocked(medicineService.getMedicineRecords).mock.calls.map(args => args[0]);
    expect(requestedPages).toEqual([1]);
    expect(wrapper.text()).toContain('New Sale');
  });
});
