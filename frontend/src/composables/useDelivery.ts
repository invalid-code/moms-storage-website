import { deliveryService } from "@/services/deliveriesServices";
import type { CreateDeliveryDTO, GenericPaginationDTO, GetDeliveriesDataDTO, GetDeliveryDTO, UpdateDeliverySelectivelyDTO } from "@my-app/types";
import { ref } from "vue";

export function useDeliveries() {
  const deliveries = ref<GetDeliveriesDataDTO[]>([]);
  const delivery = ref<GetDeliveryDTO>();
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

  const fetchDeliveries = async (page: number, limit: number, branchId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const apiResp = await deliveryService.getDeliveries(page, limit, branchId);
      deliveries.value = apiResp.data;
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

  const fetchDelivery = async (deliveryId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const apiResp = await deliveryService.getDelivery(deliveryId);
      delivery.value = apiResp.data ?? undefined;
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

  const createDelivery = async (data: CreateDeliveryDTO) => {
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

  const patchDelivery = async (id: string, data: UpdateDeliverySelectivelyDTO) => {
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

  return { deliveries, delivery, pagination, isLoading, error, fetchDeliveries, fetchDelivery, createDelivery, patchDelivery };
}
