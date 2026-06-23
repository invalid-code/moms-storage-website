import { http } from "@/helper/requestHelper";

export const medicineService = {
  async getMedicineRecords(page: number, limit: number, medicineName: string) {
    return http(`/item?page=${page}&limit=${limit}&stockName=${medicineName}`, { method: "GET"});
  }
};