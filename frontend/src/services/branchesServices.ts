import { http } from "@/helper/requestHelper";
import type { GetBranchLowestStocksRespDTO, GetBranchStocksRespDTO, GetBranchesLowestStocksRespDTO, GetBranchStockRespDTO, GetBranchesRespDTO } from "@my-app/types";

export const branchService = {
  async getBranches() {
    return http<GetBranchesRespDTO>(`/branch`, { method: "GET" });
  },
  async getBranchesLowestStock() {
    return http<GetBranchesLowestStocksRespDTO>(`/branch/lowest-stock`, { method: "GET" });
  },
  async getBranch(id: string, page: number, limit: number, stockName: string, stockQuantity: number | null) {
    return http<GetBranchStocksRespDTO>(`/branch/${id}?page=${page}&limit=${limit}&stockName=${stockName}&stockQuantity=${stockQuantity === null ? '' : stockQuantity}`, { method: "GET" });
  },
  async getBranchStock(id: string, stockId: string) {
    return http<GetBranchStockRespDTO>(`/branch/${id}/stock/${stockId}`, { method: "GET" });
  },
  async getBranchLowestStocks(id: string, page: number, limit: number) {
    return http<GetBranchLowestStocksRespDTO>(`/branch/${id}/lowest-stock?page=${page}&limit=${limit}`, { method: "GET" });
  }
};