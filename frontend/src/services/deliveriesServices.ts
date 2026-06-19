export const deliveryService = {
  async getDeliveries(page: number, limit: number) {
    const response = await fetch(`http://localhost:5000/api/delivery?page=${page}&limit=${limit}`);
    return response;
  },
  async createDelivery(data) {
    const response = await fetch(`http://localhost:5000/api/delivery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
    });
    return response;
  },
  async patchDelivery(id: string, data) {
    const response = await fetch(`http://localhost:5000/api/delivery/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
    });
    return response;
  }
};