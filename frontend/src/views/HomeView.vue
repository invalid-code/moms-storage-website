<script setup lang="ts">
import search from '../assets/search.png'
import BranchesDropdown from '@/components/BranchesDropdown.vue';
import InfoCard from '@/components/InfoCard.vue';
import StockCard from '@/components/StockCard.vue';
import { ref, onMounted, computed, watch } from 'vue'

const items = ref({});
const deliveries = ref({});
const error = ref("");
const isItemLoading = ref(true);
const isDeliveryLoading = ref(true);
const curPage = ref(1);

const getCurPageItems = async (page = 1, limit = 10) => {
  try {
    isItemLoading.value = true;
    error.value = "";

    const response = await fetch(`http://localhost:5000/api/item?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    items.value = result;
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = `An unexpected error occurred: ${err}`;
    }
  } finally {
    isItemLoading.value = false;
  }
}

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

onMounted(() => {
  getCurPageItems(curPage.value, 8);
  get3RecentDeliveries(1, 3);
});
watch(curPage, (newPage) => {
  getCurPageItems(newPage, 8);
});
</script>

<template>
  <div class="grid grid-cols-[1fr_4fr] grid-rows-2 gap-x-9.25 gap-y-15.25 px-11.25 py-11.5 h-full">
    <InfoCard title="Low Stocks" table-color="EF2D56">
      <template v-for="i in Array.from({ length: 3 }, (_, i) => 0 + i)" #[`row-${i}`]>
        <div class="flex items-center">
          <div class="w-6.25 h-6.25 bg-red-600 rounded-[50%]"></div>
          <p class="text-[30px] whitespace-nowrap ml-3.75">Stock Name</p>
        </div>
        <div class="text-[20px]">Branch Name</div>
      </template>
    </InfoCard>
    <div class="bg-white row-span-2 rounded-[25px] overflow-hidden px-7.5 py-4.5">
      <div class="flex mb-12.75 justify-between">
        <div class="bg-[#363537] px-3.25 py-1.5 rounded-[15px] flex">
          <input
            class="placeholder:text-white placeholder:text-[23px] bg-[#5B5A5E80] rounded-[10px] pl-3 caret-white text-white mr-1.5 h-full w-[320px]"
            type="text" placeholder="Search stock...">
          <button class="shrink-0 bg-[#5B5A5E80] rounded-[10px] px-2 py-1">
            <img class="w-9.5 h-9.5" :src="search" alt="stock search button">
          </button>
        </div>
        <div class="flex">
          <BranchesDropdown />
          <div class="flex items-center px-3.5">
            <div class="w-7.5 h-7.5 bg-red-600 rounded-[50%]"></div>
            <p class="text-[23px] ml-2.75">Low</p>
          </div>
          <button class="bg-[#DCED31] px-3.5 py-3.75 rounded-[20px] text-[23px]">Apply</button>
        </div>
      </div>
      <div class="grid grid-cols-[200px_200px_200px_200px] mb-6.25 gap-x-9.25 gap-y-15 justify-center">
        <template v-if="!isItemLoading">
          <StockCard v-for="item in items.data" :stock-name="item.name" />
        </template>
      </div>
      <div class="flex gap-5.25 justify-center">
        <button class="bg-[#ED7D3A] text-white w-12.5 h-13.25 text-[23px] rounded-[10px]">&lt;</button>
        <template v-if="!isItemLoading">
          <button v-for="i in Array.from({ length: items.pagination.totalPages }, (_, i) => 0 + i)"
            class="bg-[#ED7D3A] text-white w-12.5 h-13.25 text-[23px] rounded-[10px]" @click="curPage = i + 1">{{ i + 1
            }}</button>
          <button class="bg-[#ED7D3A] text-white w-12.5 h-13.25 text-[23px] rounded-[10px]">&gt;</button>
        </template>
      </div>
    </div>
    <template v-if="!isDeliveryLoading">
      <InfoCard title="Delivery Status" table-color="ED7D3A">
        <template v-for="(delivery, i) in deliveries" #[`row-${i}`]>
          <div>
            <h1 class="text-[30px] whitespace-nowrap">{{ delivery.branchDetails.name }}</h1>
          </div>
          <div class="text-[20px]">
            <template v-if="delivery.delivered">Delivered</template>
            <template v-else>Pending</template>
          </div>
        </template>
      </InfoCard>
    </template>
  </div>
</template>

<style scoped></style>
