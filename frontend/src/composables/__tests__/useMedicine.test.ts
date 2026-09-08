import { beforeEach, describe, expect, it, vi } from 'vitest';
import { medicineService } from '@/services/medicineServices';
import { useMedicineRecord, useMedicineRecords } from '@/composables/useMedicine';

vi.mock('@/services/medicineServices', () => ({
  medicineService: {
    getMedicineRecords: vi.fn(),
    getMedicineRecord: vi.fn(),
  },
}));

const service = vi.mocked(medicineService);

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

describe('useMedicineRecords', () => {
  it('fetchMedicineRecords stores records and pagination', async () => {
    const data = [{ _id: 'm1', name: 'Para', count: 10 }];
    service.getMedicineRecords.mockResolvedValue({ success: true, data, pagination });

    const { medicineRecords, pagination: pages, fetchMedicineRecords } = useMedicineRecords();

    await fetchMedicineRecords(1, 10, '');

    expect(medicineRecords.value).toEqual(data);
    expect(pages.value).toEqual(pagination);
    expect(service.getMedicineRecords).toHaveBeenCalledWith(1, 10, '');
  });

  it('fetchMedicineRecords stores the error on failure', async () => {
    service.getMedicineRecords.mockRejectedValue(new Error('down'));

    const { error, isLoading, fetchMedicineRecords } = useMedicineRecords();

    await fetchMedicineRecords(1, 10, '');

    expect(error.value).toBe('down');
    expect(isLoading.value).toBe(false);
  });
});

describe('useMedicineRecord', () => {
  it('fetchMedicineRecord replaces the record when data is present', async () => {
    service.getMedicineRecord.mockResolvedValue({
      success: true,
      data: { _id: 'm1', name: 'Ibu', count: 5 },
    });

    const { medicineRecord, fetchMedicineRecord } = useMedicineRecord();

    await fetchMedicineRecord('m1');

    expect(medicineRecord.value).toEqual({ _id: 'm1', name: 'Ibu', count: 5 });
  });

  it('fetchMedicineRecord keeps the previous record when data is null', async () => {
    service.getMedicineRecord.mockResolvedValue({ success: true, data: null });

    const { medicineRecord, fetchMedicineRecord } = useMedicineRecord();
    const before = { ...medicineRecord.value };

    await fetchMedicineRecord('missing');

    expect(medicineRecord.value).toEqual(before);
  });
});
