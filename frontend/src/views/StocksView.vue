<script setup lang="ts">
import InteractiveTable from '@/components/InteractiveTable.vue';
import { useBranch, useBranches, useBranchStock } from '@/composables/useBranch';
import { useMedicineRecords } from '@/composables/useMedicine';
import { onMounted, ref, watch } from 'vue';

const interactiveColumns = ["Branch"];

// const isBranchesLoading = ref(true);
// const isBranchStocksLoading = ref(true);
// const stocksRes = ref([]);
// const stocks = ref({});
const curSelectedBranch = ref("");
const curSelectedBranchRow = ref(new Array(10).fill(null));
const tooLargeContent = ref(false);
const nextPageI = ref(0);

const { medicineRecords, isLoading: medicineRecordsLoading, error: medicineRecordsError, fetchMedicineRecords } = useMedicineRecords();
const { branches, isLoading: branchesLoading, error: branchesError, fetchBranches } = useBranches();
const { branchStock, isLoading: branchStockLoading, error: branchStockError, fetchBranchStock } = useBranchStock();
const { branch, isLoading: branchLoading, error: branchError, fetchBranch } = useBranch();

const handle = (_: string) => {
  nextPageI.value += 1;
};

watch(nextPageI, async (newNextPageI) => {
  if (newNextPageI < 3) return;
  if (curSelectedBranch.value === "") {
    fetchMedicineRecords(newNextPageI, 10, "");
  } else {
    fetchBranch(curSelectedBranch.value, newNextPageI, 10, "");
  }
});

watch(curSelectedBranch, (newCurSelectedBranch) => {
  fetchBranch(newCurSelectedBranch, 1, 10, "");

  if (newCurSelectedBranch !== "") {
    curSelectedBranchRow.value = curSelectedBranchRow.value.map((_) => newCurSelectedBranch);
  } else {
    curSelectedBranchRow.value = new Array(10).fill(null);
  }
});

onMounted(() => {
  fetchBranches();
  fetchBranch("", 1, 10, "");
});
</script>

<template>
  <div class="px-29.5 py-16.75 h-full">
    <template v-if="!isBranchStocksLoading">
      <InteractiveTable table-color="0CCE6B" :interactive-columns="interactiveColumns" :content="stocks"
        class="grid-cols-3 auto-rows-[9.089%] h-212.5" :interactive-headers="interactiveColumns" :-row-amt="10"
        :class="{ 'overflow-y-scroll': tooLargeContent, 'overflow-hidden': !tooLargeContent }" @seen="handle"
        :next-page-i="10">
        <template v-for="header in interactiveColumns" #[`headers-${header}`]>
          <select v-model="curSelectedBranch">
            <option value="">Choose a Branch</option>
            <template v-if="!isBranchesLoading">
              <option v-for="branch in branches" :value="branch._id">{{ branch.name.toUpperCase() }}</option>
            </template>
          </select>
        </template>
        <template v-for="i in Array.from({ length: stocks['Stock Name'].length }, (_, i) => 0 + i)" #[`row-${i}`]>
          <select v-model="curSelectedBranchRow[i]" @change="(() => getRowBranchStocks(i))">
            <option :value="null">Choose A Branch</option>
            <template v-if="!isBranchesLoading">
              <option v-for="branch in branches" :value="branch._id">{{
                branch.name.toUpperCase() }}</option>
            </template>
          </select>
        </template>
      </InteractiveTable>
    </template>
  </div>
</template>

<style scoped></style>
