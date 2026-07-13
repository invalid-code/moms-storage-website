import { http } from "@/helper/requestHelper";
import type { CreateDeliveryDTO, CreateDeliveryRespDTO, GetDeliveriesRespDTO, GetDeliveryRespDTO, UpdateDeliveryRespDTO, UpdateDeliverySelectivelyDTO } from "@my-app/types";

export const deliveryService = {
  async getDeliveries(page: number, limit: number, branchId: string) {
    return http<GetDeliveriesRespDTO>(`/delivery?page=${page}&limit=${limit}&branchId=${branchId}`, { method: "GET" });
  },
  async getDelivery(deliveryId: string) {
    return http<GetDeliveryRespDTO>(`/delivery/${deliveryId}`, { method: "GET" });
  },
  async createDelivery(data: CreateDeliveryDTO) {
    return http<CreateDeliveryRespDTO>(`/delivery`, {
      method: "POST", headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
  },
  async patchDelivery(id: string, data: UpdateDeliverySelectivelyDTO) {
    return http<UpdateDeliveryRespDTO>(`/delivery/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });
  }
};