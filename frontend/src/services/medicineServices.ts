import { http } from "@/helper/requestHelper";
import type { GetMedicineRespDTO,  GetMedicinesRespDTO } from "@my-app/types";

export const medicineService = {
  async getMedicineRecords(page: number, limit: number, medicineName: string) {
    return http<GetMedicinesRespDTO>(`/item?page=${page}&limit=${limit}&stockName=${medicineName}`, { method: "GET"});
  },
  async getMedicineRecord(id: string) {
    return http<GetMedicineRespDTO>(`/item/${id}`, { method: "GET"});
  }
};