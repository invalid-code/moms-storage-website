import type { ObjectId } from "mongodb";
import { http } from "@/helper/requestHelper";
import type { BranchDocument, GetBranchLowestStocksRespDTO, GetBranchStocksByIdRespDTO, GetLowestStockOverviewRespDTO, GetSingleStockInBranchRespDTO } from "@my-app/types";

export const branchService = {
  async getBranches() {
    return http(`/branch`, { method: "GET" });
  },
  async getBranchesLowestStock() {
    return http<GetLowestStockOverviewRespDTO>(`/branch/lowest-stock`, { method: "GET" });
  },
  async getBranch(id: string, page: number, limit: number, stockName: string, stockQuantity: number | null) {
    return http<GetBranchStocksByIdRespDTO>(`/branch/${id}?page=${page}&limit=${limit}&stockName=${stockName}&stockQuantity=${stockQuantity === null ? '' : stockQuantity}`, { method: "GET" });
  },
  async getBranchStock(id: string, stockId: string) {
    return http<GetSingleStockInBranchRespDTO>(`/branch/${id}/stock/${stockId}`, { method: "GET" });
  },
  async getBranchLowestStocks(id: string, page: number, limit: number) {
    return http<GetBranchLowestStocksRespDTO>(`/branch/${id}/lowest-stock?page=${page}&limit=${limit}`, { method: "GET" });
  }
};