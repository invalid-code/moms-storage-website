import { deliveryService } from "@/services/deliveriesServices";
import { ref } from "vue";

export function useDeliveries() {
  const deliveries = ref([]);
  const isLoading = ref(false);
  const error = ref<Error | string | null>(null);

  const fetchDeliveries = async (page: number, limit: number) => {
    isLoading.value = true;
    error.value = null;
    try {
      deliveries.value = await deliveryService.getDeliveries(page, limit);
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

  return { deliveries, isLoading, error, fetchDeliveries };
}

export function useCreateDelivery() {
  const isLoading = ref(false);
  const error = ref<Error | string | null>(null);

  const createDelivery = async (data) => {
    isLoading.value = true;
    error.value = null;
    try {
      await deliveryService.createDelivery(data);
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

  return { isLoading, error, createDelivery };
}

export function usePatchDelivery() {
  const isLoading = ref(false);
  const error = ref<Error | string | null>(null);

  const patchDelivery = async (id: string, data) => {
    isLoading.value = true;
    error.value = null;
    try {
      await deliveryService.patchDelivery(id, data);
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

  return { isLoading, error, patchDelivery };
}