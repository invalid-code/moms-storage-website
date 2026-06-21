<script setup lang="ts">
import InteractiveTable from '@/components/InteractiveTable.vue';
import { useBranch, useBranches, useBranchStock } from '@/composables/useBranch';
import { useMedicineRecords } from '@/composables/useMedicine';
import { computed, onMounted, ref, watch } from 'vue';

const interactiveColumns = ["Branch"];

const curSelectedBranch = ref("");
const curSelectedBranchRow = ref(new Array(10).fill(null));
const tooLargeContent = ref(false);
const curPage = ref(1);

const { medicineRecords, pagination: medicineRecordsPagination, isLoading: medicineRecordsLoading, error: medicineRecordsError, fetchMedicineRecords } = useMedicineRecords();
const { branches, isLoading: branchesLoading, error: branchesError, fetchBranches } = useBranches();
const { branchStock, isLoading: branchStockLoading, error: branchStockError, fetchBranchStock } = useBranchStock();
const { branch, isLoading: branchLoading, error: branchError, fetchBranch } = useBranch();
let isFirst = true;
let stockName = [];
let quantity = [];

const translatedMedicineRecords = computed(() => {
  stockName.push(...medicineRecords.value.map(medicineRecord => medicineRecord.name));
  quantity.push(...medicineRecords.value.map(medicineRecord => medicineRecord.count));
  return {
    "Stock Name": stockName,
    Branch: [],
    Quantity: quantity
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

const handle = (_: string) => {
  if (curPage.value <= medicineRecordsPagination.value.totalPages) {
    curPage.value += 1;
  }
};

watch(curPage, async (newCurPage) => {
  if (newCurPage < 3) return;
  if (curSelectedBranch.value === "") {
    fetchMedicineRecords(newCurPage, 10, "");
  } else {
    fetchBranch(curSelectedBranch.value, newCurPage, 10, "");
  }
});

watch(curSelectedBranch, (newCurSelectedBranch) => {
  if (newCurSelectedBranch !== "") {
    // curSelectedBranchRow.value = curSelectedBranchRow.value.map((_) => newCurSelectedBranch);
  } else {
    fetchMedicineRecords(1, 10, "");
    isFirst = true;
  }
});

onMounted(() => {
  fetchMedicineRecords(curPage.value, 10, "");
  curPage.value += 1;
  fetchBranches();
  fetchBranch("", 1, 10, "");
});
</script>

<template>
  <div class="px-29.5 py-16.75 h-full">
    <div v-show="!medicineRecordsLoading">
      <InteractiveTable table-color="0CCE6B" :interactive-columns="interactiveColumns"
        :content="translatedMedicineRecords" class="grid-cols-3 auto-rows-[9.089%] h-212.5"
        :interactive-headers="interactiveColumns" :-row-amt="10"
        :class="{ 'overflow-y-scroll': tooLargeContent, 'overflow-hidden': !tooLargeContent }" @seen="handle"
        :next-page-i="10">
        <template v-for="header in interactiveColumns" #[`headers-${header}`]>
          <div v-show="!branchesLoading">
            <select v-model="curSelectedBranch">
              <option value="">Choose a Branch</option>
              <option v-for="branch in branches" :value="branch._id">{{ branch.name.toUpperCase() }}</option>
            </select>
          </div>
        </template>
        <template v-for="i in Array.from({ length: translatedMedicineRecords['Stock Name'].length }, (_, i) => 0 + i)"
          #[`row-${i}`]>
          <div v-show="!branchesLoading">
            <select v-model="curSelectedBranchRow[i]" @change="getRowBranchStocks(i)">
              <option :value="null">Choose A Branch</option>
              <option v-for="branch in branches" :value="branch._id">{{
                branch.name.toUpperCase() }}</option>
            </select>
          </div>
        </template>
      </InteractiveTable>
    </div>
  </div>
</template>

<style scoped></style>
