import { branchService } from "@/services/branchesServices";
import { ref } from "vue";
import type { BranchDocument, GenericPaginationDTO, GetBranchesLowestStocksDTO, GetBranchLowestStocksItemDTO, GetBranchStockDTO, GetBranchStockItemDTO, GetBranchStockRespDTO } from "@my-app/types";

export function useBranches() {
  const branches = ref<BranchDocument[]>([]);
  const branchesLowestStocks = ref<GetBranchesLowestStocksDTO[]>([]);
  const branchStocks = ref<GetBranchStockItemDTO[]>([]);
  const branchStock = ref<GetBranchStockDTO>();
  const branchLowestStocks = ref<GetBranchLowestStocksItemDTO[]>([]);
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

  const fetchBranches = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      branches.value = (await branchService.getBranches()).data;
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

  const fetchBranchesLowestStocks = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const apiResp = await branchService.getBranchesLowestStock();
      branchesLowestStocks.value = apiResp.data;
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

  const fetchBranch = async (id: string, page: number, limit: number, stockName: string, stockQuantity: number | null) => {
    isLoading.value = true;
    error.value = null;
    try {
      const apiResp = await branchService.getBranch(id, page, limit, stockName, stockQuantity);
      branchStocks.value = apiResp.data;
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

  const fetchBranchStock = async (id: string, stockId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const apiResp = await branchService.getBranchStock(id, stockId);
      branchStock.value = apiResp.data;
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

  const fetchBranchLowestStocks = async (id: string, page: number, limit: number) => {
    isLoading.value = true;
    error.value = null;
    try {
      const apiResp = await branchService.getBranchLowestStocks(id, page, limit);
      branchLowestStocks.value = apiResp.data;
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

  return { branches, branchesLowestStocks, branchStocks, branchStock, branchLowestStocks, pagination, isLoading, error, fetchBranches, fetchBranchesLowestStocks, fetchBranch, fetchBranchStock, fetchBranchLowestStocks };
}