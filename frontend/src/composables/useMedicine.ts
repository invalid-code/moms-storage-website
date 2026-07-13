import { medicineService } from '@/services/medicineServices';
import type { GenericPaginationDTO, MedicineDocument } from '@my-app/types';
import { ref } from 'vue';

export function useMedicineRecords() {
  const medicineRecords = ref<MedicineDocument[]>([]);
  const pagination = ref<GenericPaginationDTO>({
    currentPage: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 0,
    totalItems: 0,
    totalPages: 0
  });
  const isLoading = ref(false);
  const error = ref<Error | string | null>(null);

  const fetchMedicineRecords = async (page: number, limit: number, medicineName: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const apiResp = await medicineService.getMedicineRecords(page, limit, medicineName);
      medicineRecords.value = apiResp.data;
      pagination.value = apiResp.pagination;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = `An unexpected error occurred: ${err}`;
      }
    } finally {
      isLoading.value = false;
    }
  };

  return { medicineRecords, pagination, isLoading, error, fetchMedicineRecords };
}

export function useMedicineRecord() {
  const medicineRecord = ref<MedicineDocument>({
    count: 0,
    name: ""
  });
  const isLoading = ref(false);
  const error = ref<Error | string | null>(null);

  const fetchMedicineRecord = async (id: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const apiResp = await medicineService.getMedicineRecord(id);
      medicineRecord.value = apiResp.data;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = `An unexpected error occurred: ${err}`;
      }
    } finally {
      isLoading.value = false;
    }
  };

  return { medicineRecord, isLoading, error, fetchMedicineRecord };
}