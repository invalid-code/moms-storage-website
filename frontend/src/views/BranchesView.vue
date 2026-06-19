<script setup lang="ts">
import BranchesDropdown from '@/components/BranchesDropdown.vue';
import StaticTable from '@/components/StaticTable.vue';
import { useBranchLowestStocks, useBranch } from '@/composables/useBranch';
import { useDeliveries } from '@/composables/useDelivery';
import { onMounted, ref, watch } from 'vue';

const isLowStockLoading = ref(true);
const isStocksLoading = ref(true);
const isDeliveryLoading = ref(true);
const lowestStocks = ref({});
const stocks = ref({});
const curSelectedBranch = ref("6a22d28e5882d14a0b85c54b"); // todo: when first load get the default selected value

const { branchLowestStocks, isLoading: branchLowestStocksLoading, error: branchLowestStocksError, fetchBranchLowestStocks } = useBranchLowestStocks();
const { branch, isLoading: branchStockLoading, error: branchStockError, fetchBranch } = useBranch();
const { deliveries, isLoading, error, fetchDeliveries } = useDeliveries();

const branchesDropdownEmitHandler = (payload: string) => {
  curSelectedBranch.value = payload;
};

watch(curSelectedBranch, (newSelectedBranch) => {
  fetchBranchLowestStocks(newSelectedBranch, 1, 4);
  fetchBranch(newSelectedBranch, 1, 10, "");
  // getBranchDeliveries(newSelectedBranch, 1, 4);
  fetchDeliveries(1, 4);
});
onMounted(() => {
  fetchBranchLowestStocks(curSelectedBranch.value, 1, 4);
  fetchBranch(curSelectedBranch.value, 1, 10, "");
  // getBranchDeliveries(curSelectedBranch.value, 1, 4);
  fetchDeliveries(1, 4);
});
</script>

<template>
  <div class="py-18.5 px-24 h-full flex flex-col">
    <BranchesDropdown class="mb-7 flex justify-end" @cur-selected="branchesDropdownEmitHandler"
      :default-value="curSelectedBranch" />
    <div class="grid grid-cols-2 gap-x-10.75 gap-y-10.5 grow">
      <StaticTable v-if="!isLowStockLoading" title="Low Stocks" :content="lowestStocks" class="grid-cols-2"
        table-color="#EF2D56" :maximum="4" />
      <StaticTable v-if="!isStocksLoading" title="Stocks" :content="stocks" class="grid-cols-2 row-span-2" :maximum="10"
        table-color="#0CCE6B" />
      <StaticTable v-if="!isDeliveryLoading" title="Deliveries" :content="deliveries" class="grid-cols-3"
        table-color="#ED7D3A" :maximum="4" />
    </div>
  </div>
</template>

<style scoped></style>
