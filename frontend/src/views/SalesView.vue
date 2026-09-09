<script setup lang="ts">
import InteractiveTable from '@/components/InteractiveTable.vue';
import CreateSaleModal from '@/components/CreateSaleModal.vue';
import { useBranches } from '@/composables/useBranch';
import { useSales } from '@/composables/useSale';
import { computed, onMounted, ref, watch } from 'vue';

const curSelectedBranch = ref("");
const tooLargeContent = ref(false);
const curPage = ref(1);
const isSaleModalOpen = ref(false);
let isFirst = true;
const salesId = ref<string[]>([]);

const { branches, isLoading: branchesLoading, error: branchesError, fetchBranches } = useBranches();
const { sales, pagination: salesPagination, isLoading: salesLoading, error: salesError, fetchSales } = useSales();

const formatPrice = (value: number) =>
  value.toLocaleString("en-PH", { style: "currency", currency: "PHP" });

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });

const resetSales = () => {
  isFirst = true;
  sales.value = [];
  salesId.value = [];
  curPage.value = 1;
};

watch(branches, newBranches => {
  if (curSelectedBranch.value === "" && newBranches.length > 0) {
    curSelectedBranch.value = newBranches[0]?._id ?? "";
  }
});

watch(sales, newSales => {
  salesId.value.push(...newSales.map(sale => sale._id ?? ""));
  if (isFirst && salesPagination.value.totalItems > 10) {
    tooLargeContent.value = true;
    fetchSales(curPage.value, 10, curSelectedBranch.value);
    isFirst = false;
  }
});

const translatedSales = computed(() => {
  return {
    "Date Sold": sales.value.map(sale => formatDate(sale.dateSold)),
    Total: sales.value.map(sale => formatPrice(sale.total)),
    Status: sales.value.map(sale => sale.voided ? "Voided" : "Active"),
  };
});

const handle = (_: string) => {
  if (curPage.value <= salesPagination.value.totalPages) {
    curPage.value += 1;
  }
};

const refreshSales = () => {
  resetSales();
  fetchSales(curPage.value, 10, curSelectedBranch.value);
  curPage.value += 1;
};

watch(curPage, async (newCurPage) => {
  if (newCurPage < 3) return;
  fetchSales(newCurPage, 10, curSelectedBranch.value);
});

watch(curSelectedBranch, (newCurSelectedBranch) => {
  if (newCurSelectedBranch === "") return;
  resetSales();

  fetchSales(curPage.value, 10, newCurSelectedBranch);

  curPage.value += 1;
});

onMounted(() => {
  fetchBranches();
});
</script>

<template>
  <div class="p-5 h-[calc(100vh-100px)]">
    <div class="flex items-center mb-2 gap-4">
      <select v-show="!branchesLoading" v-model="curSelectedBranch"
        class="text-[14px] font-bold border-2 rounded-[5px] px-2 py-1">
        <option v-for="branch in branches" :value="branch._id">{{ branch.name.toUpperCase() }}</option>
      </select>
      <button class="bg-[#ED7D3A] px-3.75 py-1.5 rounded-[5px] text-[14px] font-bold ml-auto"
        :disabled="curSelectedBranch === ''" @click="isSaleModalOpen = true">
        New Sale
      </button>
    </div>
    <CreateSaleModal :isOpen="isSaleModalOpen" :branchId="curSelectedBranch" @close="isSaleModalOpen = false"
      @sold="refreshSales" />
    <InteractiveTable v-show="!salesLoading" table-color="#0CCE6B" :content="translatedSales"
      :interactive-columns="['Status']" class="grid-cols-3 auto-rows-[9.089%] h-full" :-row-amt="10"
      :class="{ 'overflow-y-scroll': tooLargeContent, 'overflow-hidden': !tooLargeContent }" @seen="handle"
      :next-page-i="10">
      <template v-for="(_, i) in translatedSales['Status']" #[`row-${i}`]>
        <router-link :to="{ name: 'sale', params: { saleId: salesId[i] } }">
          {{ translatedSales['Status'][i] }}
        </router-link>
      </template>
    </InteractiveTable>
  </div>
</template>

<style scoped></style>
