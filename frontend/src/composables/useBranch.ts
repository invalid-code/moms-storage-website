import { branchService } from "@/services/branchesServices";
import { ref } from "vue";
import type { GenericPaginationDTO, GetBranchesLowestStocksDTO, GetBranchLowestStocksItemDTO, GetBranchStockItemDTO, GetBranchStockRespDTO } from "@my-app/types";

export function useBranches() {
  const branches = ref([]);
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

  return { branches, isLoading, error, fetchBranches };
}

export function useBranchesLowestStocks() {
  const branchesLowestStocks = ref<GetBranchesLowestStocksDTO[]>([]);
  const isLoading = ref(false);
  const error = ref<Error | string | null>(null);

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

  return { branchesLowestStocks, isLoading, error, fetchBranchesLowestStocks };
}

export function useBranch() {
  const branch = ref<GetBranchStockItemDTO[]>([]);
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

  const fetchBranch = async (id: string, page: number, limit: number, stockName: string, stockQuantity: number  | null) => {
    isLoading.value = true;
    error.value = null;
    try {
      const apiResp = await branchService.getBranch(id, page, limit, stockName, stockQuantity);
      branch.value = apiResp.data;
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

  return { branch, pagination, isLoading, error, fetchBranch };
}

export function useBranchStock() {
  const branchStock = ref<GetBranchStockRespDTO>({
    success: false,
  });
  const isLoading = ref(false);
  const error = ref<Error | string | null>(null);

  const fetchBranchStock = async (id: string, stockId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      branchStock.value = await branchService.getBranchStock(id, stockId);
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

  return { branchStock, isLoading, error, fetchBranchStock };
}

export function useBranchLowestStocks() {
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

  return { branchLowestStocks, isLoading, error, fetchBranchLowestStocks };
}