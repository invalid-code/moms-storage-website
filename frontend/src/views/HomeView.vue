<script setup lang="ts">
import search from '../assets/search.png';
import BranchesDropdown from '@/components/BranchesDropdown.vue';
import checked from '../assets/checked.png';
import deliveryTruckBlack from '../assets/delivery_truck_black.png';
import paperAirplaneBlack from '../assets/paper_airplane_black.png';
import InfoCard from '@/components/InfoCard.vue';
import StockCard from '@/components/StockCard.vue';
import { useBranch, useBranchesLowestStocks } from '@/composables/useBranch';
import { useDeliveries } from '@/composables/useDelivery';
import { useMedicineRecords } from '@/composables/useMedicine';
import { ref, onMounted, watch } from 'vue';

const curPage = ref(1);
const stockSearch = ref('');
const curSelectedBranch = ref("");
const selectedStockQuantity = ref<number | null>(null);
const stockQuantityColor = ref("text-gray-700");
const stockQuantityText = ref("All");
const startingPoint = ref(0);
let selectedBranch = ref("");
let medicineRecordsCnt = 4;
const showFilters = ref(false);

const branchesDropdownEmitHandler = (payload: string) => {
  selectedBranch.value = payload;
};

const { medicineRecords, pagination: medicineRecordsPagination, isLoading: medicineRecordsLoading, error: medicineRecordsError, fetchMedicineRecords } = useMedicineRecords();
const { deliveries, pagination: _, isLoading: deliveriesLoading, error: deliveriesError, fetchDeliveries } = useDeliveries();
const { branchesLowestStocks, isLoading: branchesLowestStocksLoading, error: branchesLowestStocksError, fetchBranchesLowestStocks } = useBranchesLowestStocks();
const { branch, isLoading: branchLoading, error: branchError, fetchBranch } = useBranch();

const submitFilters = async () => {
  showFilters.value = false;
  curSelectedBranch.value = selectedBranch.value;
  curPage.value = 1;
  startingPoint.value = 0;
  if (curSelectedBranch.value === "") {
    fetchMedicineRecords(curPage.value, medicineRecordsCnt, stockSearch.value);
  } else {
    fetchBranch(curSelectedBranch.value, curPage.value, medicineRecordsCnt, stockSearch.value, selectedStockQuantity.value);
  }
};

const selectStockQuantity = () => {
  if (curSelectedBranch.value === "") {
    return;
  }
  if (selectedStockQuantity.value === null) {
    selectedStockQuantity.value = 30;
    stockQuantityColor.value = "text-red-600";
    stockQuantityText.value = "Low";
  } else if (selectedStockQuantity.value === 90) {
    selectedStockQuantity.value = null;
    stockQuantityColor.value = "text-gray-700";
    stockQuantityText.value = "All";
  } else {
    selectedStockQuantity.value += 30;
    if (selectedStockQuantity.value === 60) {
      stockQuantityColor.value = "text-yellow-400";
      stockQuantityText.value = "Half";
    } else {
      stockQuantityColor.value = "text-green-700";
      stockQuantityText.value = "Stocked";
    }
  }
};

const moveRight = () => {
  if (startingPoint.value + 5 < medicineRecordsPagination.value.totalPages) {
    startingPoint.value += 1;
  }
};

const moveLeft = () => {
  if (startingPoint.value != 0) {
    startingPoint.value -= 1;
  }
};

onMounted(() => {
  fetchMedicineRecords(curPage.value, medicineRecordsCnt, "");
  fetchDeliveries(1, 3, '');
  fetchBranchesLowestStocks();

});
</script>

<template>
  <div class="grid grid-cols-2 gap-5 p-5 h-full">
    <InfoCard v-show="!branchesLowestStocksLoading" title="Low Stocks" table-color="#EF2D56">
      <template v-for="(branchStock, i) in branchesLowestStocks" #[`row-${i}`]>
        <div class="flex items-center px-4.75 pt-5">
          <div class="w-2 h-2 bg-red-600 rounded-[50%]"></div>
          <p class="text-[12px] whitespace-nowrap ml-3.75">{{ branchStock["stock-name"] }}</p>
          <div class="ml-auto text-[9px]">{{ branchStock.branch }}</div>
        </div>
      </template>
    </InfoCard>
    <InfoCard v-show="!deliveriesLoading" title="Delivery Status" table-color="#ED7D3A">
      <template v-for="(delivery, i) in deliveries" #[`row-${i}`]>
        <div class="flex h-7.5 py-2.5 px-1.25 items-center">
          <img class="max-h-2.25 mr-1.5" :src="checked" alt="delivered" />
          <p class="text-[10px]">
            {{ delivery.branchDetails.name }}
          </p>
          <div class="flex flex-col ml-auto">
            <div class="flex">
              <img :src="deliveryTruckBlack" class="max-h-3" alt="delivery date requested icon" />
              <p class="text-[6px]">
                {{ new Date(delivery.dateRequested).toLocaleDateString("en-PH", {
                  year: "numeric", month: "long", day:
                    "numeric"
                }) }}
              </p>
            </div>
            <div v-if="delivery.delivered" class="flex">
              <img :src="paperAirplaneBlack" class="max-h-3" alt="delivery date received icon" />
              <p class="text-[6px]">
                {{ new Date(delivery.dateDelivered).toLocaleDateString("en-PH", {
                  year: "numeric", month: "long", day:
                    "numeric"
                }) }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </InfoCard>
    <div class="fixed bg-white p-2.25 rounded-[25px] shadow" :class="{ 'hidden': !showFilters }">
      <div class="bg-[#373638] p-1.25 rounded-[3px] flex mb-2.25">
        <input class="bg-[rgba(91,90,94,0.5)] rounded-xs" type="text" v-model="stockSearch">
        <div class="bg-[rgba(91,90,94,0.5)] rounded-xs ml-1.25 flex justify-center items-center w-[24px]">
          <img class="h-3.25 w-3.25" :src="search" alt="">
        </div>
      </div>
      <div class="flex mb-2.25">
        <p :class="stockQuantityColor" @click="selectStockQuantity">{{ stockQuantityText }}</p>
        <BranchesDropdown class="ml-auto" @cur-selected="branchesDropdownEmitHandler" />
      </div>
      <div class="flex justify-center">
        <button class="bg-[#DCED31] rounded-[5px] px-2.25 py-1.25" @click="showFilters = false">Cancel</button>
        <button class="bg-[#ED7D3A] rounded-[5px] px-2.25 py-1.25 ml-3.5" @click="submitFilters">Submit</button>
      </div>
    </div>
    <div class="bg-white col-span-2 rounded-[25px] overflow-hidden p-5">
      <div class="flex justify-end items-center mb-1.5 text-[8px] px-2.25 py-1.25" @click="showFilters = true">Filters
      </div>
      <div class="grid grid-cols-2 gap-x-5 gap-y-5 grid-rows-2">
        <template v-if="curSelectedBranch === ''">
          <StockCard v-show="!medicineRecordsLoading" v-for="medicineRecord in medicineRecords"
            :stock-name="medicineRecord.name" />
        </template>
        <template v-else>
          <StockCard v-show="!branchLoading" v-for="branchStocks in branch" :stock-name="branchStocks['stock-name']" />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
