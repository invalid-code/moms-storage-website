import { branchService } from "@/services/branchesServices";
import { ref } from "vue";

export function useBranches() {
  const branches = ref([]);
  const isLoading = ref(false);
  const error = ref<Error | string | null>(null);

  const fetchBranches = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      branches.value = await branchService.getBranches();
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
  const branchesLowestStocks = ref([]);
  const isLoading = ref(false);
  const error = ref<Error | string | null>(null);

  const fetchBranchesLowestStocks = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      branchesLowestStocks.value = await branchService.getBranchesLowestStock();
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
  const branch = ref([]);
  const isLoading = ref(false);
  const error = ref<Error | string | null>(null);

  const fetchBranch = async (id: string, page: number, limit: number, stockName: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      branch.value = await branchService.getBranch(id, page, limit, stockName);
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

  return { branch, isLoading, error, fetchBranch };
}

export function useBranchStock() {
  const branchStock = ref([]);
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
  const branchLowestStocks = ref([]);
  const isLoading = ref(false);
  const error = ref<Error | string | null>(null);

  const fetchBranchLowestStocks = async (id: string, page: number, limit: number) => {
    isLoading.value = true;
    error.value = null;
    try {
      branchLowestStocks.value = await branchService.getBranchLowestStocks(id, page, limit);
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