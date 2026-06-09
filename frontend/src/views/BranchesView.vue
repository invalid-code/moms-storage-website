<script setup lang="ts">
import BranchesDropdown from '@/components/BranchesDropdown.vue';
import StaticTable from '@/components/StaticTable.vue';
import { onMounted, ref, watch } from 'vue';

const isLowStockLoading = ref(true);
const isStocksLoading = ref(true);
const isDeliveryLoading = ref(true);
const error = ref("");
const lowestStocks = ref({});
const stocks = ref({});
const deliveries = ref({});
const curSelectedBranch = ref("6a22d28e5882d14a0b85c54b"); // todo: when first load get the default selected value

const branchesDropdownEmitHandler = (payload: string) => {
  curSelectedBranch.value = payload;
};

const getBranchLowestStock = async (selectedBranchId: string, page = 1, limit = 10) => {
  try {
    isLowStockLoading.value = true;
    error.value = "";

    const response = await fetch(`http://localhost:5000/api/branch/${selectedBranchId}/lowest-stock?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    lowestStocks.value = {
      "Stock Name": result.data.map((lowStock) => lowStock["stock-name"]),
      "Stock Amount": result.data.map((lowStock) => lowStock.stock_onhold_amount)
    }
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = `An unexpected error occurred: ${err}`;
    }
  } finally {
    isLowStockLoading.value = false;
  }
};

const getBranchStocks = async (selectedBranchId: string, page = 1, limit = 10) => {
  try {
    isStocksLoading.value = true;
    error.value = "";

    const response = await fetch(`http://localhost:5000/api/branch/${selectedBranchId}?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    stocks.value = {
      "Stock Name": result.data.map((stock) => stock["stock-name"]),
      "Stock Amount": result.data.map((stock) => stock.stock_onhold_amount)
    }
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = `An unexpected error occurred: ${err}`;
    }
  } finally {
    isStocksLoading.value = false;
  }
};

const getBranchDeliveries = async (selectedBranchId: string, page = 1, limit = 10) => {
  try {
    isDeliveryLoading.value = true;
    error.value = "";

    const response = await fetch(`http://localhost:5000/api/delivery/${selectedBranchId}?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    deliveries.value = {
      "Delivery Status": result.data.map((delivery) => delivery.delivered ? "Delivered" : "Pending"),
      "Date Requested": result.data.map((delivery) => new Date(delivery.dateRequested).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })),
      "Date Received": result.data.map((delivery) => new Date(delivery.dateDelivered).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }))
    };
    console.log(result);
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = `An unexpected error occurred: ${err}`;
    }
  } finally {
    isDeliveryLoading.value = false;
  }
};

watch(curSelectedBranch, (newSelectedBranch) => {
  getBranchLowestStock(newSelectedBranch, 1, 4);
  getBranchStocks(newSelectedBranch, 1, 10);
  getBranchDeliveries(newSelectedBranch, 1, 4);
});
onMounted(() => {
  getBranchLowestStock(curSelectedBranch.value, 1, 4);
  getBranchStocks(curSelectedBranch.value, 1, 10);
  getBranchDeliveries(curSelectedBranch.value, 1, 4);
});
</script>

<template>
  <div class="py-18.5 px-24 h-full">
    <BranchesDropdown class="mb-7" @cur-selected="branchesDropdownEmitHandler" />
    <div class="grid grid-cols-2 gap-x-10.75 gap-y-10.5 h-full">
      <template v-if="!isLowStockLoading">
        <StaticTable title="Low Stocks" :content="lowestStocks" class="grid-cols-2" table-color="#EF2D56" />
      </template>
      <template v-if="!isStocksLoading">
        <StaticTable title="Stocks" :content="stocks" class="grid-cols-2 grid-rows-10 row-span-2"
          table-color="#0CCE6B" />
      </template>
      <template v-if="!isDeliveryLoading">
        <StaticTable title="Deliveries" :content="deliveries" class="grid-cols-3" table-color="#ED7D3A" />
      </template>
    </div>
  </div>
</template>

<style scoped></style>
