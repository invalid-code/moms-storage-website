<script setup lang="ts">
import InteractiveTable from '@/components/InteractiveTable.vue';
import { useBranch, useBranches, useBranchStock } from '@/composables/useBranch';
import { useMedicineRecord, useMedicineRecords } from '@/composables/useMedicine';
import { computed, onMounted, ref, watch } from 'vue';

const interactiveColumns = ["Branch"];

const curSelectedBranch = ref("");
const curSelectedBranchRow = ref(new Array(10).fill(null));
const tooLargeContent = ref(false);
const curPage = ref(1);
let selectedRow = 0;

const medicineRecords = ref([]);
const branchStocks = ref([]);
const { medicineRecords: curMedicineRecords, pagination: medicineRecordsPagination, isLoading: medicineRecordsLoading, error: medicineRecordsError, fetchMedicineRecords } = useMedicineRecords();
const { branches, isLoading: branchesLoading, error: branchesError, fetchBranches } = useBranches();
const { branchStock, error: branchStockError, fetchBranchStock } = useBranchStock();
const { branch: curBranchStocks, pagination: branchPagination, isLoading: _, error: branchError, fetchBranch } = useBranch();
const { medicineRecord, isLoading, error, fetchMedicineRecord } = useMedicineRecord();
let isFirst = true;

watch(curMedicineRecords, newCurMedicineRecords => medicineRecords.value.push(...newCurMedicineRecords));

const translatedMedicineRecords = computed(() => {
  return {
    "Stock Name": medicineRecords.value.map(medicineRecord => medicineRecord.name),
    Branch: [],
    Quantity: medicineRecords.value.map(medicineRecord => medicineRecord.count)
  };
});

watch(translatedMedicineRecords, _ => {
  if (medicineRecordsPagination.value.currentPage > 1) {
    curSelectedBranchRow.value.push(...new Array(10).fill(null));
  }

  if (isFirst && medicineRecordsPagination.value.totalItems > 10) {
    tooLargeContent.value = true;
    fetchMedicineRecords(curPage.value, 10, "");
    isFirst = false;
  }
});

watch(curBranchStocks, newCurBranchStock => branchStocks.value.push(...newCurBranchStock));

const translatedBranchStocks = computed(() => {
  return {
    "Stock Name": branchStocks.value.map(branchStock => branchStock["stock-name"]),
    Branch: [],
    Quantity: branchStocks.value.map(branchStock => branchStock.stock_onhold_amount)
  };
});

watch(translatedBranchStocks, _ => {
  if (branchPagination.value.currentPage > 1) {
    curSelectedBranchRow.value.push(...new Array(10).fill(curSelectedBranch.value));
  }

  if (isFirst && branchPagination.value.totalItems > 10) {
    tooLargeContent.value = true;
    fetchBranch(curSelectedBranch.value, curPage.value, 10, "", null);
    isFirst = false;
  }
});

watch(medicineRecord, newMedicineRecord => {
  if (curSelectedBranch.value === "") {
    medicineRecords.value[selectedRow].name = newMedicineRecord.data.name;
    medicineRecords.value[selectedRow].count = newMedicineRecord.data.count;
  } else {
    branchStocks.value[selectedRow]["stock-name"] = newMedicineRecord.data.name;
    branchStocks.value[selectedRow].stock_onhold_amount = newMedicineRecord.data.count;
  }
});

watch(branchStock, newBranchStock => {
  if (curSelectedBranch.value === "") {
    medicineRecords.value[selectedRow].name = newBranchStock.data.stock_name;
    medicineRecords.value[selectedRow].count = newBranchStock.data.stock_onhold_amount;
  } else {
    branchStocks.value[selectedRow]["stock-name"] = newBranchStock.data.stock_name;
    branchStocks.value[selectedRow].stock_onhold_amount = newBranchStock.data.stock_onhold_amount;
  }
});

const handle = (_: string) => {
  if (curPage.value <= medicineRecordsPagination.value.totalPages) {
    curPage.value += 1;
  }
};

const getRowBranchStocks = (id: number) => {
  selectedRow = id;

  let stockId = "";
  if (curSelectedBranch.value === "") {
    stockId = medicineRecords.value[id]._id;
  } else {
    stockId = branchStocks.value[id]["stock-id"];
  }

  if (curSelectedBranchRow.value[id] === null) {
    fetchMedicineRecord(stockId);
  } else {
    fetchBranchStock(curSelectedBranchRow.value[id], stockId);
  }
};

watch(curPage, async (newCurPage) => {
  if (newCurPage < 3) return;

  if (curSelectedBranch.value === "") {
    fetchMedicineRecords(newCurPage, 10, "");
  } else {
    fetchBranch(curSelectedBranch.value, newCurPage, 10, "", null);
  }
});

watch(curSelectedBranch, (newCurSelectedBranch) => {
  isFirst = true;
  medicineRecords.value = [];
  branchStocks.value = [];
  curPage.value = 1;

  if (newCurSelectedBranch !== "") {
    curSelectedBranchRow.value = new Array(10).fill(curSelectedBranch.value); // todo needs to match what we receive
    fetchBranch(newCurSelectedBranch, curPage.value, 10, "", null);
  } else {
    curSelectedBranchRow.value = new Array(10).fill(null);
    fetchMedicineRecords(curPage.value, 10, "");
  }

  curPage.value += 1;
});

onMounted(() => {
  fetchMedicineRecords(curPage.value, 10, "");
  curPage.value += 1;
  fetchBranches();
});
</script>

<template>
  <div class="p-5 h-[calc(100vh-100px)]">
    <InteractiveTable v-if="curSelectedBranch === ''" v-show="!medicineRecordsLoading" table-color="#0CCE6B"
      :interactive-columns="interactiveColumns" :content="translatedMedicineRecords"
      class="grid-cols-3 auto-rows-[9.089%] h-full" :interactive-headers="interactiveColumns" :-row-amt="10"
      :class="{ 'overflow-y-scroll': tooLargeContent, 'overflow-hidden': !tooLargeContent }" @seen="handle"
      :next-page-i="10">
      <template v-for="header in interactiveColumns" #[`headers-${header}`]>
        <div v-show="!branchesLoading">
          <select v-model="curSelectedBranch">
            <option value="">Branch</option>
            <option v-for="branch in branches" :value="branch._id">{{ branch.name.toUpperCase() }}</option>
          </select>
        </div>
      </template>
      <template v-for="i in Array.from({ length: translatedMedicineRecords['Stock Name'].length }, (_, i) => 0 + i)"
        #[`row-${i}`]>
        <div v-show="!branchesLoading">
          <select v-model="curSelectedBranchRow[i]" @change="getRowBranchStocks(i)">
            <option :value="null">Branch</option>
            <option v-for="branch in branches" :value="branch._id">{{
              branch.name.toUpperCase() }}</option>
          </select>
        </div>
      </template>
    </InteractiveTable>
    <InteractiveTable v-else v-show="!branchesLoading" table-color="#0CCE6B" :interactive-columns="interactiveColumns"
      :content="translatedBranchStocks" class="grid-cols-3 auto-rows-[9.089%] h-full"
      :interactive-headers="interactiveColumns" :-row-amt="10"
      :class="{ 'overflow-y-scroll': tooLargeContent, 'overflow-hidden': !tooLargeContent }" @seen="handle"
      :next-page-i="10">
      <template v-for="header in interactiveColumns" #[`headers-${header}`]>
        <select v-show="!branchesLoading" v-model="curSelectedBranch">
          <option value="">Choose a Branch</option>
          <option v-for="branch in branches" :value="branch._id">{{ branch.name.toUpperCase() }}</option>
        </select>
      </template>
      <template v-for="i in Array.from({ length: translatedBranchStocks['Stock Name'].length }, (_, i) => 0 + i)"
        #[`row-${i}`]>
        <select v-show="!branchesLoading" v-model="curSelectedBranchRow[i]" @change="getRowBranchStocks(i)">
          <option :value="null">Choose A Branch</option>
          <option v-for="branch in branches" :value="branch._id">{{
            branch.name.toUpperCase() }}</option>
        </select>
      </template>
    </InteractiveTable>
  </div>
</template>

<style scoped></style>
