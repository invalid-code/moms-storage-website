<script setup lang="ts">
import search from '../assets/search.png';
import BranchesDropdown from '@/components/BranchesDropdown.vue';
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
const stockQuantityColor = ref("bg-gray-700");
const stockQuantityText = ref("All");
const startingPoint = ref(0);
let selectedBranch = ref("");
let medicineRecordsCnt = 4;
if (window.innerWidth >= 1280) {
  medicineRecordsCnt = 8;
}

const branchesDropdownEmitHandler = (payload: string) => {
  selectedBranch.value = payload;
};

const { medicineRecords, pagination: medicineRecordsPagination, isLoading: medicineRecordsLoading, error: medicineRecordsError, fetchMedicineRecords } = useMedicineRecords();
const { deliveries, pagination: _, isLoading: deliveriesLoading, error: deliveriesError, fetchDeliveries } = useDeliveries();
const { branchesLowestStocks, isLoading: branchesLowestStocksLoading, error: branchesLowestStocksError, fetchBranchesLowestStocks } = useBranchesLowestStocks();
const { branch, pagination: branchPagination, isLoading: branchLoading, error: branhcError, fetchBranch } = useBranch();

const submitFilters = async () => {
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
  fetchDeliveries(1, 3);
  fetchBranchesLowestStocks();
});

watch(curPage, (newPage) => {
  if (curSelectedBranch.value === "") {
    fetchMedicineRecords(newPage, medicineRecordsCnt, stockSearch.value);
  } else {
    fetchBranch(curSelectedBranch.value, curPage.value, medicineRecordsCnt, stockSearch.value, selectedStockQuantity.value);
  }
});
</script>

<template>
  <div class="grid grid-cols-2 gap-5 px-5 py-5">
    <InfoCard v-show="!branchesLowestStocksLoading" title="Low Stocks" table-color="#EF2D56">
      <template v-for="(branchStock, i) in branchesLowestStocks" #[`row-${i}`]>
        <div class="flex items-center px-4.75 pt-5">
          <div class="w-2 h-2 bg-red-600 rounded-[50%]"></div>
          <p class="text-[12px] whitespace-nowrap ml-3.75">{{ branchStock["stock-name"] }}</p>
          <div class="text-[9px]">{{ branchStock.branch }}</div>
        </div>
      </template>
    </InfoCard>
    <InfoCard v-show="!deliveriesLoading" title="Delivery Status" table-color="#ED7D3A">
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
    <div class="bg-white col-span-2 rounded-[25px] overflow-hidden px-7.5 py-4.5">
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
