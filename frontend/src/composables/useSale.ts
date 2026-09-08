import { saleService } from "@/services/salesServices";
import type { CreateSaleDTO, GenericPaginationDTO, GetSaleDTO } from "@my-app/types";
import { ref } from "vue";

export function useSales() {
  const sales = ref<GetSaleDTO[]>([]);
  const sale = ref<GetSaleDTO>();
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

  const fetchSales = async (page: number, limit: number, branchId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const apiResp = await saleService.getSales(page, limit, branchId);
      sales.value = apiResp.data;
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

  const fetchSale = async (saleId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const apiResp = await saleService.getSale(saleId);
      sale.value = apiResp.data ?? undefined;
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

  const createSale = async (data: CreateSaleDTO) => {
    isLoading.value = true;
    error.value = null;
    try {
      await saleService.createSale(data);
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

  const voidSale = async (id: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await saleService.voidSale(id);
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

  return { sales, sale, pagination, isLoading, error, fetchSales, fetchSale, createSale, voidSale };
}
