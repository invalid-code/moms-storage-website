<script setup lang="ts">
import BranchesDropdown from '@/components/BranchesDropdown.vue';
import StaticTable from '@/components/StaticTable.vue';
import { useBranchLowestStocks, useBranch } from '@/composables/useBranch';
import { useBranchDeliveries } from '@/composables/useDelivery';
import { computed, onMounted, ref, watch } from 'vue';

const curSelectedBranch = ref("6a22d28e5882d14a0b85c54b"); // todo: when first load get the default selected value

const { branchLowestStocks, isLoading: branchLowestStocksLoading, error: branchLowestStocksError, fetchBranchLowestStocks } = useBranchLowestStocks();
const { branch, isLoading: branchLoading, error: branchStockError, fetchBranch } = useBranch();
const { branchDeliveries, isLoading: branchDeliveriesLoading, error: branchDeliveriesError, fetchBranchDeliveries } = useBranchDeliveries();

const translatedBranchLowestStock = computed(() => {
  return {
    "Stock Name": branchLowestStocks.value.map(branchLowestStock => branchLowestStock["stock-name"]),
    "Stock Amount": branchLowestStocks.value.map(branchLowestStock => branchLowestStock.stock_onhold_amount)
  }
});

const translatedBranch = computed(() => {
  return {
    "Stock Name": branch.value.map(branchStock => branchStock["stock-name"]),
    "Stock Amount": branch.value.map(branchStock => branchStock.stock_onhold_amount)
  }
});

const translatedDeliveries = computed(() => {
  return {
    "": branchDeliveries.value.map(branchDelivery => branchDelivery.delivered ? "Delivered" : "Pending"),
    "Date Requested": branchDeliveries.value.map(branchDelivery => new Date(branchDelivery.dateRequested).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })),
    "Date Received": branchDeliveries.value.map(branchDelivery => new Date(branchDelivery.dateDelivered).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })),
  }
});

const branchesDropdownEmitHandler = (payload: string) => {
  curSelectedBranch.value = payload;
};

watch(curSelectedBranch, (newSelectedBranch) => {
  fetchBranchLowestStocks(newSelectedBranch, 1, 4);
  fetchBranch(newSelectedBranch, 1, 10, "", null);
  fetchBranchDeliveries(newSelectedBranch, 1, 4);
});
onMounted(() => {
  fetchBranchLowestStocks(curSelectedBranch.value, 1, 4);
  fetchBranch(curSelectedBranch.value, 1, 10, "", null);
  fetchBranchDeliveries(curSelectedBranch.value, 1, 4);
});
</script>

<template>
  <div class="p-5 h-full flex flex-col">
    <BranchesDropdown class="mb-5 flex justify-end" @cur-selected="branchesDropdownEmitHandler"
      :default-value="curSelectedBranch" />
    <div class="grid grid-cols-2 gap-5 grow">
      <StaticTable v-if="!branchLowestStocksLoading" title="Low Stocks" :content="translatedBranchLowestStock"
        class="grid-cols-2" table-color="#EF2D56" :maximum="4" />
      <StaticTable v-if="!branchDeliveriesLoading" title="Deliveries" :content="translatedDeliveries"
        class="grid-cols-3" table-color="#ED7D3A" :maximum="4" />
      <StaticTable v-if="!branchLoading" title="Stocks" :content="translatedBranch" class="grid-cols-2 col-span-2"
        :maximum="10" table-color="#0CCE6B" />
    </div>
  </div>
</template>

<style scoped></style>
