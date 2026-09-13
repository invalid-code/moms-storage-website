<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import InteractiveTable from './InteractiveTable.vue';
import { useSales } from '@/composables/useSale.ts';
import { useBranches } from '@/composables/useBranch.ts';
import { useMedicineRecords } from '@/composables/useMedicine.ts';
import type { CreateSaleDTO, MedicineDTO } from '@my-app/types';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  branchId: {
    type: String,
    required: true
  }
});
const emit = defineEmits(['close', 'sold']);

const quantities = ref<Record<string, number>>({});
const tooLargeContent = ref(false);

// The medicines composable replaces its list on every fetch, so accumulate
// pages locally instead. fetchedPages also guards the scroll observer, which
// re-fires for row 0 on every re-render and would otherwise refetch endlessly.
const allMedicines = ref<MedicineDTO[]>([]);
const fetchedPages = ref<Set<number>>(new Set());
const inFlightPages = new Set<number>();

const resetMedicines = () => {
  allMedicines.value = [];
  fetchedPages.value = new Set();
  inFlightPages.clear();
};

const { error: saleError, isLoading: saleLoading, createSale } = useSales();
const { branchStocks, error: branchError, fetchBranch } = useBranches();
const { medicineRecords, pagination: medicineRecordsPagination, isLoading: medicineLoading, error: medicineError, fetchMedicineRecords } = useMedicineRecords();

const formatPrice = (value: number) =>
  value.toLocaleString("en-PH", { style: "currency", currency: "PHP" });

const loadMedicinePage = async (page: number) => {
  if (page < 1 || fetchedPages.value.has(page) || inFlightPages.has(page)) return;
  // currentPage === 0 means no fetch has completed yet, so allow page 1.
  // After the first fetch this bound also stops the empty-catalogue case
  // (totalPages === 0) from recursing forever.
  const { totalPages, currentPage } = medicineRecordsPagination.value;
  if (currentPage !== 0 && page > totalPages) return;
  inFlightPages.add(page);
  try {
    await fetchMedicineRecords(page, 10, "");
  } finally {
    inFlightPages.delete(page);
  }
  if (medicineError.value !== null) {
    return;
  }
  fetchedPages.value.add(page);
  const knownIds = new Set(allMedicines.value.map(medicine => medicine._id));
  for (const record of medicineRecords.value) {
    if (!knownIds.has(record._id)) {
      allMedicines.value.push(record);
      knownIds.add(record._id);
    }
  }
  if (medicineRecordsPagination.value.hasNextPage) {
    await loadMedicinePage(page + 1);
  }
};

const loadAllMedicines = () => {
  resetMedicines();
  void loadMedicinePage(1);
};

const saleRows = computed(() => {
  return allMedicines.value.map(medicineRecord => {
    const id = medicineRecord._id ?? "";
    const availability = props.branchId === ""
      ? null
      : (branchStocks.value.find(branchStock => branchStock["stock-id"] === id)?.stock_onhold_amount ?? 0);
    return {
      id,
      name: medicineRecord.name,
      // Legacy medicine docs may have no price yet; null renders as "-" and
      // blocks the row from being sold (the backend rejects priceless items).
      price: medicineRecord.price ?? null as number | null,
      availability,
      quantity: quantities.value[id] ?? 0,
    };
  });
});

const translatedSaleRows = computed(() => {
  return {
    "Stock Name": saleRows.value.map(row => row.name),
    Price: saleRows.value.map(row => row.price === null ? "-" : formatPrice(row.price)),
    Available: saleRows.value.map(row => row.availability === null ? "-" : row.availability),
    Quantity: saleRows.value.map(row => row.quantity),
  };
});

const saleTotal = computed(() =>
  saleRows.value.reduce((sum, row) => sum + (quantities.value[row.id] ?? 0) * (row.price ?? 0), 0)
);

watch(allMedicines, newAllMedicines => {
  tooLargeContent.value = newAllMedicines.length > 5;
}, { deep: true });

watch(() => props.branchId, (newBranchId) => {
  quantities.value = {};
  if (newBranchId !== "") {
    fetchBranch(newBranchId, 1, 100, "", null);
  }
});

const setQuantity = (id: string, value: number) => {
  quantities.value[id] = Number.isFinite(value) && value > 0 ? Math.trunc(value) : 0;
};

const handleConfirm = async () => {
  const items = saleRows.value
    .filter(row => row.price !== null && (quantities.value[row.id] ?? 0) > 0)
    .map(row => ({ stockId: row.id, quantity: Math.trunc(quantities.value[row.id] ?? 0) }));
  if (props.branchId === "" || items.length === 0) return;

  const data: CreateSaleDTO = {
    branchId: props.branchId,
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
  // Eager loading above already fetches everything; this is only a safety net
  // for retries / races. Find the smallest unfetched page instead of assuming
  // contiguous pages (size + 1 breaks if a page failed and was retried).
  let next = 1;
  while (fetchedPages.value.has(next) || inFlightPages.has(next)) next += 1;
  const { totalPages, currentPage } = medicineRecordsPagination.value;
  if (currentPage !== 0 && next > totalPages) return;
  void loadMedicinePage(next);
};

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadAllMedicines();
    if (props.branchId !== "") {
      fetchBranch(props.branchId, 1, 100, "", null);
    }
  }
});

onMounted(() => {
  if (props.isOpen) {
    loadAllMedicines();
  }
  if (props.isOpen && props.branchId !== "") {
    fetchBranch(props.branchId, 1, 100, "", null);
  }
});
</script>

<template>
  <div v-if="isOpen" class="fixed inset-x-0 top-10 z-50 flex items-center justify-center p-4">
    <div class="rounded-xl bg-white p-6 w-[calc(100vw-2rem)] max-w-150">
      <h2 class="text-[16px] font-bold mb-4">New Sale</h2>
      <InteractiveTable v-show="!medicineLoading || allMedicines.length > 0" class="grid-cols-4 auto-rows-[16.5%] h-60 mb-5" table-color="#0CCE6B"
        :content="translatedSaleRows" :interactive-columns="['Quantity']" :-row-amt="5" @seen="handle"
        :class="{ 'overflow-y-scroll': tooLargeContent, 'overflow-hidden': !tooLargeContent }" :next-page-i="5">
        <template v-for="(row, i) in saleRows" #[`row-${i}`]>
          <input type="number" min="0" :max="row.availability ?? undefined" :value="row.quantity"
            :disabled="row.price === null" title="No price set for this stock"
            @input="setQuantity(row.id, Number(($event.target as HTMLInputElement).value))" class="w-16 text-center" />
        </template>
      </InteractiveTable>
      <div class="flex items-center mb-4">
        <p class="text-[14px] font-bold">Total: {{ formatPrice(saleTotal) }}</p>
        <p v-if="medicineError !== null" class="text-[12px] text-[#EF2D56] ml-4">Stocks failed to load: {{ medicineError }}</p>
        <p v-else-if="branchError !== null" class="text-[12px] text-[#EF2D56] ml-4">Availability failed to load: {{ branchError }}</p>
        <p v-else-if="saleError !== null" class="text-[12px] text-[#EF2D56] ml-4">{{ saleError }}</p>
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
