<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import BranchesDropdown from './BranchesDropdown.vue';
import InteractiveTable from './InteractiveTable.vue';
import { useSales } from '@/composables/useSale.ts';
import { useBranches } from '@/composables/useBranch.ts';
import { useMedicineRecords } from '@/composables/useMedicine.ts';
import type { CreateSaleDTO } from '@my-app/types';

defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});
const emit = defineEmits(['close', 'sold']);

const curSelectedBranch = ref("");
const quantities = ref<Record<string, number>>({});
const tooLargeContent = ref(false);
const curPage = ref(1);
let isFirst = true;

const { error: saleError, isLoading: saleLoading, createSale } = useSales();
const { branchStocks, fetchBranch } = useBranches();
const { medicineRecords, pagination: medicineRecordsPagination, isLoading: medicineLoading, fetchMedicineRecords } = useMedicineRecords();

const formatPrice = (value: number) =>
  value.toLocaleString("en-PH", { style: "currency", currency: "PHP" });

const saleRows = computed(() => {
  return medicineRecords.value.map(medicineRecord => {
    const id = medicineRecord._id ?? "";
    const availability = curSelectedBranch.value === ""
      ? null
      : (branchStocks.value.find(branchStock => branchStock["stock-id"] === id)?.stock_onhold_amount ?? 0);
    return {
      id,
      name: medicineRecord.name,
      price: medicineRecord.price,
      availability,
      quantity: quantities.value[id] ?? 0,
    };
  });
});

const translatedSaleRows = computed(() => {
  return {
    "Stock Name": saleRows.value.map(row => row.name),
    Price: saleRows.value.map(row => formatPrice(row.price)),
    Available: saleRows.value.map(row => row.availability === null ? "-" : row.availability),
    Quantity: saleRows.value.map(row => row.quantity),
  };
});

const saleTotal = computed(() =>
  saleRows.value.reduce((sum, row) => sum + (quantities.value[row.id] ?? 0) * row.price, 0)
);

watch(translatedSaleRows, _ => {
  if (isFirst && medicineRecordsPagination.value.totalItems > 10) {
    tooLargeContent.value = true;
    fetchMedicineRecords(curPage.value, 10, "");
    isFirst = false;
  }
});

const onBranchSelected = (branchId: string) => {
  curSelectedBranch.value = branchId;
  quantities.value = {};
  if (branchId !== "") {
    fetchBranch(branchId, 1, 100, "", null);
  }
};

const setQuantity = (id: string, value: number) => {
  quantities.value[id] = Number.isFinite(value) && value > 0 ? Math.trunc(value) : 0;
};

const handleConfirm = async () => {
  const items = saleRows.value
    .filter(row => (quantities.value[row.id] ?? 0) > 0)
    .map(row => ({ stockId: row.id, quantity: Math.trunc(quantities.value[row.id] ?? 0) }));
  if (curSelectedBranch.value === "" || items.length === 0) return;

  const data: CreateSaleDTO = {
    branchId: curSelectedBranch.value,
    items,
  };
  await createSale(data);
  if (saleError.value !== null) return;

  quantities.value = {};
  emit("sold");
  emit("close");
};

const handleClose = () => {
  quantities.value = {};
  emit("close");
};

const handle = (_: string) => {
  if (curPage.value <= medicineRecordsPagination.value.totalPages) {
    curPage.value += 1;
  }
};

watch(curPage, async (newCurPage) => {
  if (newCurPage < 3) return;
  fetchMedicineRecords(newCurPage, 10, "");
});

onMounted(() => {
  fetchMedicineRecords(1, 10, "");
  curPage.value += 1;
});
</script>

<template>
  <div v-if="isOpen" class="fixed top-10 left-[30%] z-50 flex items-center justify-center p-4">
    <div class="rounded-xl bg-white p-6 w-150">
      <h2 class="text-[16px] font-bold mb-4">New Sale</h2>
      <BranchesDropdown class="mb-5" @cur-selected="onBranchSelected" />
      <InteractiveTable v-show="!medicineLoading" class="auto-rows-[16.5%] h-60 mb-5" table-color="0CCE6B"
        :content="translatedSaleRows" :interactive-columns="['Quantity']" :-row-amt="5" @seen="handle"
        :class="{ 'overflow-y-scroll': tooLargeContent, 'overflow-hidden': !tooLargeContent }" :next-page-i="5">
        <template v-for="(row, i) in saleRows" #[`row-${i}`]>
          <input type="number" min="0" :max="row.availability ?? undefined" :value="row.quantity"
            @input="setQuantity(row.id, Number(($event.target as HTMLInputElement).value))" class="w-16 text-center" />
        </template>
      </InteractiveTable>
      <div class="flex items-center mb-4">
        <p class="text-[14px] font-bold">Total: {{ formatPrice(saleTotal) }}</p>
        <p v-if="saleError !== null" class="text-[12px] text-[#EF2D56] ml-4">{{ saleError }}</p>
      </div>
      <button class="rounded-lg bg-[#DCED31] px-4 py-2 text-sm font-medium mr-5" @click="handleClose">
        Cancel
      </button>
      <button class="rounded-lg bg-[#ED7D3A] px-4 py-2 text-sm font-medium" :disabled="saleLoading"
        @click="handleConfirm">
        Charge
      </button>
    </div>
  </div>
</template>

<style scoped></style>
