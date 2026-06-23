import { http } from "@/helper/requestHelper";

export const branchService = {
  async getBranches() {
    return http(`/branch`, { method: "GET" });
  },
  async getBranchesLowestStock() {
    return http(`/branch/lowest-stock`, { method: "GET" });
  },
  async getBranch(id: string, page: number, limit: number, stockName: string, stockQuantity: number | null) {
    return http(`/branch/${id}?page=${page}&limit=${limit}&stockName=${stockName}&stockQuantity=${stockQuantity === null ? '' : stockQuantity}`, { method: "GET" });
  },
  async getBranchStock(id: string, stockId: string) {
    return http(`/branch/${id}/stock/${stockId}`, { method: "GET" });
  },
  async getBranchLowestStocks(id: string, page: number, limit: number) {
    return http(`/branch/${id}/lowest-stock?page=${page}&limit=${limit}`, { method: "GET" });
  }
};