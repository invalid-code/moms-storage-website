<script setup lang="ts">
import search from '../assets/search.png';
import BranchesDropdown from '@/components/BranchesDropdown.vue';
import InfoCard from '@/components/InfoCard.vue';
import StockCard from '@/components/StockCard.vue';
import { useMedicineRecords } from '@/composables/useMedicine';
import { ref, onMounted, computed, watch } from 'vue';

const items = ref({});
const deliveries = ref({});
const branchStocks = ref({});
const error = ref("");
const isItemLoading = ref(true);
const isDeliveryLoading = ref(true);
const isBranchLoading = ref(true);
const curPage = ref(1);
const stockSearch = ref('');
const curSelectedBranch = ref("");
const selectedStockQuantity = ref<number | null>(null);
const stockQuantityColor = ref("bg-gray-700");
const stockQuantityText = ref("All");

const branchesDropdownEmitHandler = (payload: string) => {
  curSelectedBranch.value = payload;
};

const { error: medicineError, fetchMedicineRecords, isLoading: isMedicineLoading, medicineRecords } = useMedicineRecords();

const get3RecentDeliveries = async (page = 1, limit = 10) => {
  try {
    isDeliveryLoading.value = true;
    error.value = "";

    const response = await fetch(`http://localhost:5000/api/delivery?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    deliveries.value = result.data;
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

const get3LowestStockPerBranch = async () => {
  try {
    isBranchLoading.value = true;
    error.value = "";

    const response = await fetch("http://localhost:5000/api/branch/lowest-stock");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    branchStocks.value = result.data;
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = `An unexpected error occurred: ${err}`;
    }
  } finally {
    isBranchLoading.value = false;
  }
};

const submitFilters = async () => {
  curPage.value = 1;
  if (curSelectedBranch.value === "") {
    fetchMedicineRecords(curPage.value, 8, stockSearch.value);
  } else {
    let url = `http://localhost:5000/api/branch/${curSelectedBranch.value}?page=${curPage.value}&limit=${8}&stockName=${stockSearch.value}`;
    if (selectedStockQuantity.value !== null) {
      url += `&stockQuantity=${selectedStockQuantity.value}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    result.data = result.data.map((stock) => ({ "name": stock["stock-name"], "count": stock.stock_onhold_amount }));
    items.value = result;
  }
};

const selectStockQuantity = () => {
  if (selectedStockQuantity.value === null) {
    selectedStockQuantity.value = 30;
    stockQuantityColor.value = "bg-red-600";
    stockQuantityText.value = "Low";
  } else if (selectedStockQuantity.value === 90) {
    selectedStockQuantity.value = null;
    stockQuantityColor.value = "bg-gray-700";
    stockQuantityText.value = "All";
  } else {
    selectedStockQuantity.value += 30;
    if (selectedStockQuantity.value === 60) {
      stockQuantityColor.value = "bg-yellow-400";
      stockQuantityText.value = "Half";
    } else {
      stockQuantityColor.value = "bg-green-700";
      stockQuantityText.value = "Stocked";
    }
  }
};

onMounted(() => {
  fetchMedicineRecords(curPage.value, 8, "");
  get3RecentDeliveries(1, 3);
  get3LowestStockPerBranch();
});
watch(curPage, (newPage) => {
  fetchMedicineRecords(newPage, 8, "");
});
</script>

<template>
  <div class="grid grid-cols-[1fr_4fr] grid-rows-2 gap-x-9.25 gap-y-15.25 px-11.25 py-11.5 h-full">
    <template v-if="!isBranchLoading">
      <InfoCard title="Low Stocks" table-color="bg-[#EF2D56]">
        <template v-for="(branchStock, i) in branchStocks" #[`row-${i}`]>
          <div class="flex items-center px-4.75 pt-5">
            <div class="w-6.25 h-6.25 bg-red-600 rounded-[50%]"></div>
            <p class="text-[30px] whitespace-nowrap ml-3.75">{{ branchStock["stock-name"] }}</p>
          </div>
          <div class="text-[20px] px-4.75">{{ branchStock.branch }}</div>
        </template>
      </InfoCard>
    </template>
    <div class="bg-white row-span-2 rounded-[25px] overflow-hidden px-7.5 py-4.5">
      <div class="flex mb-12.75 justify-between">
        <div class="bg-[#363537] px-3.25 py-1.5 rounded-[15px] flex">
          <input
            class="placeholder:text-white placeholder:text-[23px] bg-[#5B5A5E80] rounded-[10px] pl-3 caret-white text-white mr-1.5 h-full w-[320px]"
            type="text" placeholder="Search stock..." v-model="stockSearch">
          <button class="shrink-0 bg-[#5B5A5E80] rounded-[10px] px-2 py-1">
            <img class="w-9.5 h-9.5" :src="search" alt="stock search button">
          </button>
        </div>
        <div class="flex">
          <BranchesDropdown @cur-selected="branchesDropdownEmitHandler" />
          <div v-if="curSelectedBranch === ''" class="flex items-center px-3.5">
            <div class="w-7.5 h-7.5 rounded-[50%] bg-gray-600"></div>
            <p class="text-[23px] ml-2.75">All</p>
          </div>
          <button v-else class="flex items-center px-3.5" @click="selectStockQuantity">
            <div class="w-7.5 h-7.5 rounded-[50%]" :class="stockQuantityColor"></div>
            <p class="text-[23px] ml-2.75">{{ stockQuantityText }}</p>
          </button>
          <button @click="submitFilters" class="bg-[#DCED31] px-3.5 py-3.75 rounded-[20px] text-[23px]">Apply</button>
        </div>
      </div>
      <div class="grid grid-cols-4 mb-6.25 gap-x-9.25 gap-y-15 grid-rows-2">
        <template v-if="!isItemLoading">
          <StockCard v-for="item in items.data" :stock-name="item.name" />
        </template>
      </div>
      <div class="flex gap-5.25 justify-center">
        <template v-if="!isItemLoading">
          <template v-if="items.pagination.totalPages > 5">
            <button class="bg-[#ED7D3A] text-white w-12.5 h-13.25 text-[23px] rounded-[10px]">&lt;</button>
          </template>
          <button v-for="i in Array.from({ length: items.pagination.totalPages }, (_, i) => 0 + i)"
            class="bg-[#ED7D3A] text-white w-12.5 h-13.25 text-[23px] rounded-[10px]" @click="curPage = i + 1">{{ i + 1
            }}</button>
          <template v-if="items.pagination.totalPages > 5">
            <button class="bg-[#ED7D3A] text-white w-12.5 h-13.25 text-[23px] rounded-[10px]">&gt;</button>
          </template>
        </template>
      </div>
    </div>
    <template v-if="!isDeliveryLoading">
      <InfoCard title="Delivery Status" table-color="bg-[#ED7D3A]">
        <template v-for="(delivery, i) in deliveries" #[`row-${i}`]>
          <div>
            <h1 class="text-[30px] whitespace-nowrap px-7.25 pt-[16.66px]">{{ delivery.branchDetails.name.toUpperCase()
              }}</h1>
          </div>
          <div class="text-[20px] px-7.25">
            <template v-if="delivery.delivered">Delivered</template>
            <template v-else>Pending</template>
          </div>
        </template>
      </InfoCard>
    </template>
  </div>
</template>

<style scoped></style>
