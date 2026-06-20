import { http } from "@/helper/requestHelper";

export const deliveryService = {
  async getDeliveries(page: number, limit: number) {
    return http(`/delivery?page=${page}&limit=${limit}`, { method: "GET" });
  },
  async getBranchDeliveries(branchId: string, page: number, limit: number) {
    return http(`/delivery/${branchId}?page=${page}&limit=${limit}`, { method: "GET" });
  },
  async createDelivery(data) {
    return http(`/delivery`, {
      method: "POST", headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
  },
  async patchDelivery(id: string, data) {
    return http(`/delivery/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });
  }
};