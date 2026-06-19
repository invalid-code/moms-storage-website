export const branchService = {
  async getBranches() {
    const response = await fetch(`http://localhost:5000/api/branch`);
    return response;
  },
  async getBranchesLowestStock() {
    const response = await fetch(`http://localhost:5000/api/branch/lowest-stock`);
    return response;
  },
  async getBranch(id: string, page: number, limit: number, stockName: string) {
    const response = await fetch(`http://localhost:5000/api/branch/${id}?page=${page}&limit=${limit}&stockName=${stockName}`);
    return response;
  },
  async getBranchStock(id: string, stockId: string) {
    const response = await fetch(`http://localhost:5000/api/branch/${id}/stock/${stockId}`);
    return response;
  },
  async getBranchLowestStocks(id: string, page: number, limit: number) {
    const response = await fetch(`http://localhost:5000/api/branch/${id}/lowest-stock?page=${page}&limit=${limit}`);
    return response;
  }
};