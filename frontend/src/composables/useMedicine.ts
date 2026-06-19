import { medicineService } from '@/services/medicineServices';
import { ref } from 'vue';

export function useMedicineRecords() {
  const medicineRecords = ref([]);
  const isLoading = ref(false);
  const error = ref<Error|string|null>(null);

  const fetchMedicineRecords = async (page: number, limit: number, medicineName: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      medicineRecords.value = await medicineService.getMedicineRecords(page, limit, medicineName);
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

  return { medicineRecords, isLoading, error, fetchMedicineRecords };
}

export function useMedicineRecord() {
  const medicineRecord = ref([]);
  const isLoading = ref(false);
  const error = ref<Error|string|null>(null);

  const fetchMedicine = async (id: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      medicineRecords.value = await medicineService.getMedicineRecord(id);
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

  return { medicineRecord, isLoading, error, fetchMedicine };
}