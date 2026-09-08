import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deliveryService } from '@/services/deliveriesServices';
import { useDeliveries } from '@/composables/useDelivery';

vi.mock('@/services/deliveriesServices', () => ({
  deliveryService: {
    getDeliveries: vi.fn(),
    getDelivery: vi.fn(),
    createDelivery: vi.fn(),
    patchDelivery: vi.fn(),
  },
}));

const service = vi.mocked(deliveryService);

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

describe('useDeliveries', () => {
  it('fetchDeliveries stores deliveries and pagination', async () => {
    const deliveries = [{ _id: 'd1', delivered: false }];
    service.getDeliveries.mockResolvedValue({ success: true, data: deliveries, pagination });

    const { deliveries: state, pagination: pages, fetchDeliveries } = useDeliveries();

    await fetchDeliveries(1, 10, 'b1');

    expect(state.value).toEqual(deliveries);
    expect(pages.value).toEqual(pagination);
    expect(service.getDeliveries).toHaveBeenCalledWith(1, 10, 'b1');
  });

  it('fetchDeliveries stores the error on failure', async () => {
    service.getDeliveries.mockRejectedValue(new Error('nope'));

    const { error, isLoading, fetchDeliveries } = useDeliveries();

    await fetchDeliveries(1, 10, '');

    expect(error.value).toBe('nope');
    expect(isLoading.value).toBe(false);
  });

  it('fetchDelivery stores the delivery when present', async () => {
    const delivery = { _id: 'd1', delivered: false };
    service.getDelivery.mockResolvedValue({ success: true, data: delivery });

    const { delivery: state, fetchDelivery } = useDeliveries();

    await fetchDelivery('d1');

    expect(state.value).toEqual(delivery);
  });

  it('fetchDelivery maps null to undefined', async () => {
    service.getDelivery.mockResolvedValue({ success: true, data: null });

    const { delivery: state, fetchDelivery } = useDeliveries();

    await fetchDelivery('missing');

    expect(state.value).toBeUndefined();
  });

  it('createDelivery forwards the DTO and patchDelivery forwards id + body', async () => {
    service.createDelivery.mockResolvedValue({ success: true, message: 'ok' });
    service.patchDelivery.mockResolvedValue({ success: true, data: null });

    const { createDelivery, patchDelivery } = useDeliveries();
    const create = { branchId: 'b1', stocksRequested: ['s1'] };
    const patch = { delivered: true, dateDelivered: '2026-01-15T00:00:00.000Z', stocksReceived: [] };

    await createDelivery(create);
    await patchDelivery('d1', patch);

    expect(service.createDelivery).toHaveBeenCalledWith(create);
    expect(service.patchDelivery).toHaveBeenCalledWith('d1', patch);
  });

  it('patchDelivery stores the error on failure', async () => {
    service.patchDelivery.mockRejectedValue(new Error('conflict'));

    const { error, patchDelivery } = useDeliveries();

    await patchDelivery('d1', { delivered: true, dateDelivered: '2026-01-15T00:00:00.000Z', stocksReceived: [] });

    expect(error.value).toBe('conflict');
  });
});
