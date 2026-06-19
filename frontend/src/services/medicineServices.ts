export const medicineService = {
  async getMedicineRecords(page: number, limit: number, medicineName: string) {
    const response = await fetch(`http://localhost:5000/api/item?page=${page}&limit=${limit}&stockName=${medicineName}`);
    return response;
  },
  async getMedicineRecord(id: string) {
    const response = await fetch(`http://localhost:5000/api/item/${id}`);
    return response;
  }
};