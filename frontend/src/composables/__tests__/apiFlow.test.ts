import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDeliveries } from '@/composables/useDelivery';
import { useMedicineRecords } from '@/composables/useMedicine';
import { useSales } from '@/composables/useSale';

afterEach(() => {
  vi.unstubAllGlobals();
});

const okJson = (payload: unknown) =>
  vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(payload),
  });

describe('delivery API flow (composable -> service -> http -> fetch)', () => {
  it('fetchDeliveries populates state from the real HTTP path', async () => {
    const payload = {
      success: true,
      data: [
        {
          _id: 'd1',
          dateRequested: '2026-01-01T00:00:00.000Z',
          dateDelivered: '2026-01-15T00:00:00.000Z',
          delivered: false,
          stocksRequested: ['s1'],
          branch: 'b1',
          branchDetails: { _id: 'b1', name: 'Main', stocks: [] },
        },
      ],
      pagination: {
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
    const fetchMock = okJson(payload);
    vi.stubGlobal('fetch', fetchMock);

    const { deliveries, pagination, error, fetchDeliveries } = useDeliveries();

    await fetchDeliveries(1, 10, 'b1');

    expect(error.value).toBeNull();
    expect(deliveries.value).toHaveLength(1);
    expect(deliveries.value[0]?._id).toBe('d1');
    expect(pagination.value.totalItems).toBe(1);
    const [req] = fetchMock.mock.calls[0] as [Request];
    expect(req.url).toBe('https://api.test/delivery?page=1&limit=10&branchId=b1');
  });

  it('patchDelivery sends the ISO-date DTO as JSON over PATCH', async () => {
    const fetchMock = okJson({ success: true, data: null });
    vi.stubGlobal('fetch', fetchMock);

    const { patchDelivery, error } = useDeliveries();
    const body = {
      delivered: true,
      dateDelivered: new Date('2026-01-15T00:00:00.000Z').toISOString(),
      stocksReceived: [{ stockId: 's1', amount: 4 }],
    };

    await patchDelivery('d1', body);

    expect(error.value).toBeNull();
    const [req] = fetchMock.mock.calls[0] as [Request];
    expect(req.method).toBe('PATCH');
    expect(req.url).toBe('https://api.test/delivery/d1');
    await expect(req.text()).resolves.toBe(JSON.stringify(body));
  });

  it('surfaces HTTP failures as composable errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) }),
    );

    const { error, isLoading, fetchDeliveries } = useDeliveries();

    await fetchDeliveries(1, 10, '');

    expect(error.value).toBe('HTTP error! status: 500');
    expect(isLoading.value).toBe(false);
  });
});

describe('medicine API flow (composable -> service -> http -> fetch)', () => {
  it('fetchMedicineRecords populates records from the real HTTP path', async () => {
    const payload = {
      success: true,
      data: [{ _id: 'm1', name: 'Paracetamol', count: 100, price: 25 }],
      pagination: {
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
    const fetchMock = okJson(payload);
    vi.stubGlobal('fetch', fetchMock);

    const { medicineRecords, fetchMedicineRecords } = useMedicineRecords();

    await fetchMedicineRecords(1, 10, '');

    expect(medicineRecords.value).toEqual([{ _id: 'm1', name: 'Paracetamol', count: 100, price: 25 }]);
    const [req] = fetchMock.mock.calls[0] as [Request];
    expect(req.url).toBe('https://api.test/item?page=1&limit=10&stockName=');
  });
});

describe('sale API flow (composable -> service -> http -> fetch)', () => {
  it('fetchSales populates state from the real HTTP path', async () => {
    const payload = {
      success: true,
      data: [
        {
          _id: 's1',
          branch: 'b1',
          items: [{ stock_id: 'm1', quantity: 2, unitPrice: 25, stock_name: 'Paracetamol' }],
          total: 50,
          dateSold: '2026-02-01T00:00:00.000Z',
          voided: false,
        },
      ],
      pagination: {
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
    const fetchMock = okJson(payload);
    vi.stubGlobal('fetch', fetchMock);

    const { sales, pagination, error, fetchSales } = useSales();

    await fetchSales(1, 10, 'b1');

    expect(error.value).toBeNull();
    expect(sales.value).toHaveLength(1);
    expect(sales.value[0]?.total).toBe(50);
    expect(pagination.value.totalItems).toBe(1);
    const [req] = fetchMock.mock.calls[0] as [Request];
    expect(req.url).toBe('https://api.test/sale?page=1&limit=10&branchId=b1');
  });

  it('createSale sends the sale DTO as JSON over POST', async () => {
    const fetchMock = okJson({ success: true, data: null });
    vi.stubGlobal('fetch', fetchMock);

    const { createSale, error } = useSales();
    const body = { branchId: 'b1', items: [{ stockId: 'm1', quantity: 2 }] };

    await createSale(body);

    expect(error.value).toBeNull();
    const [req] = fetchMock.mock.calls[0] as [Request];
    expect(req.method).toBe('POST');
    expect(req.url).toBe('https://api.test/sale');
    await expect(req.text()).resolves.toBe(JSON.stringify(body));
  });
});
