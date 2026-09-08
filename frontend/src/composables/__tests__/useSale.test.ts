import { beforeEach, describe, expect, it, vi } from 'vitest';
import { saleService } from '@/services/salesServices';
import { useSales } from '@/composables/useSale';

vi.mock('@/services/salesServices', () => ({
  saleService: {
    getSales: vi.fn(),
    getSale: vi.fn(),
    createSale: vi.fn(),
    voidSale: vi.fn(),
  },
}));

const service = vi.mocked(saleService);

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

describe('useSales', () => {
  it('fetchSales stores sales and pagination', async () => {
    const sales = [{ _id: 's1', total: 50, voided: false }];
    service.getSales.mockResolvedValue({ success: true, data: sales, pagination });

    const { sales: state, pagination: pages, fetchSales } = useSales();

    await fetchSales(1, 10, 'b1');

    expect(state.value).toEqual(sales);
    expect(pages.value).toEqual(pagination);
    expect(service.getSales).toHaveBeenCalledWith(1, 10, 'b1');
  });

  it('fetchSales stores the error on failure', async () => {
    service.getSales.mockRejectedValue(new Error('nope'));

    const { error, isLoading, fetchSales } = useSales();

    await fetchSales(1, 10, '');

    expect(error.value).toBe('nope');
    expect(isLoading.value).toBe(false);
  });

  it('fetchSale stores the sale when present', async () => {
    const sale = { _id: 's1', total: 50, voided: false };
    service.getSale.mockResolvedValue({ success: true, data: sale });

    const { sale: state, fetchSale } = useSales();

    await fetchSale('s1');

    expect(state.value).toEqual(sale);
  });

  it('fetchSale maps null to undefined', async () => {
    service.getSale.mockResolvedValue({ success: true, data: null });

    const { sale: state, fetchSale } = useSales();

    await fetchSale('missing');

    expect(state.value).toBeUndefined();
  });

  it('createSale forwards the DTO and voidSale forwards the id', async () => {
    service.createSale.mockResolvedValue({ success: true, data: null });
    service.voidSale.mockResolvedValue({ success: true, data: null });

    const { createSale, voidSale } = useSales();
    const create = { branchId: 'b1', items: [{ stockId: 's1', quantity: 2 }] };

    await createSale(create);
    await voidSale('s1');

    expect(service.createSale).toHaveBeenCalledWith(create);
    expect(service.voidSale).toHaveBeenCalledWith('s1');
  });

  it('voidSale stores the error on failure', async () => {
    service.voidSale.mockRejectedValue(new Error('already voided'));

    const { error, voidSale } = useSales();

    await voidSale('s1');

    expect(error.value).toBe('already voided');
  });
});
