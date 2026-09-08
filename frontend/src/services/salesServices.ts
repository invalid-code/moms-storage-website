import { http } from "@/helper/requestHelper";
import type { CreateSaleDTO, CreateSaleRespDTO, GetSaleRespDTO, GetSalesRespDTO, VoidSaleRespDTO } from "@my-app/types";

export const saleService = {
  async getSales(page: number, limit: number, branchId: string) {
    return http<GetSalesRespDTO>(`/sale?page=${page}&limit=${limit}&branchId=${branchId}`, { method: "GET" });
  },
  async getSale(saleId: string) {
    return http<GetSaleRespDTO>(`/sale/${saleId}`, { method: "GET" });
  },
  async createSale(data: CreateSaleDTO) {
    return http<CreateSaleRespDTO>(`/sale`, {
      method: "POST", headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
  },
  async voidSale(id: string) {
    return http<VoidSaleRespDTO>(`/sale/${id}/void`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
