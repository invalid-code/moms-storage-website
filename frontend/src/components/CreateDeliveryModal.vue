<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import BranchesDropdown from './BranchesDropdown.vue';
import InteractiveTable from './InteractiveTable.vue';
import { useCreateDelivery } from '@/composables/useDelivery.ts';
import { useMedicineRecords } from '@/composables/useMedicine.ts';

defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});
const emit = defineEmits(['close']);

const stocksId = ref([]);
const selectedStocks = ref([]);
const tooLargeContent = ref(false);
const interactiveColumns = ["Stock Name"];
const curSelectedBranch = ref("6a22d28e5882d14a0b85c54b"); // todo: when first load get the default selected value
const curPage = ref(1);
let isFirst = true;
let stockName = [];

const { isLoading: createDeliveryLoading, error: createDeliveryError, createDelivery } = useCreateDelivery();
const { medicineRecords, pagination: medicineRecordsPagination, isLoading: medicineLoading, error: medicineError, fetchMedicineRecords } = useMedicineRecords();

const translatedMedicineRecords = computed(() => {
  stocksId.value = medicineRecords.value.map(medicineRecord => medicineRecord._id);
  stockName.push(...medicineRecords.value.map(medicineRecord => medicineRecord.name));
  return {
    "Stock Name": stockName
  };
});

watch(translatedMedicineRecords, _ => {
  if (isFirst && medicineRecordsPagination.value.totalItems > 10) {
    tooLargeContent.value = true;
    fetchMedicineRecords(curPage.value, 10, "");
    isFirst = false;
  }
});

const handleConfirm = async () => {
  const data = {
    branchId: curSelectedBranch.value,
    stocksRequested: selectedStocks.value,
  }
  createDelivery(data);
  emit("close");
};

const handle = (_: string) => {
  if (curPage.value <= medicineRecordsPagination.value.totalPages) {
    curPage.value += 1;
  }
};

watch(curPage, async (newCurPage) => {
  if (newCurPage < 3) return;
  fetchMedicineRecords(newCurPage, 5, "");
});

onMounted(() => {
  fetchMedicineRecords(1, 5, "");
  curPage.value += 1;
});
</script>

<template>
  <div v-if="isOpen" class="fixed top-20 left-[77%] z-50 flex items-center justify-center p-4">
    <div class="rounded-xl bg-white p-6">
      <BranchesDropdown class="mb-5" :default-value="curSelectedBranch" @cur-selected="" />
      <InteractiveTable v-show="!medicineLoading" class="auto-rows-[16.5%] h-60 mb-5" table-color="0CCE6B"
        :content="translatedMedicineRecords" :interactive-columns="interactiveColumns" :-row-amt="5" @seen="handle"
        :class="{ 'overflow-y-scroll': tooLargeContent, 'overflow-hidden': !tooLargeContent }" :next-page-i="5">
        <template v-for="i in Array.from({ length: translatedMedicineRecords['Stock Name'].length }, (_, i) => 0 + i)"
          #[`row-${i}`]>
          <div class="w-full flex justify-center" :class="{ 'bg-[#55555580]': selectedStocks.includes(stocksId[i]) }"
            @click="() => !selectedStocks.includes(stocksId[i]) ? selectedStocks.push(stocksId[i]) : selectedStocks = selectedStocks.filter(selectedStock => selectedStock !== stocksId[i])">
            {{ translatedMedicineRecords["Stock Name"][i] }}
          </div>
        </template>
      </InteractiveTable>
      <button class="rounded-lg bg-[#DCED31] px-4 py-2 text-sm font-medium mr-5" @click="emit('close')">
        Cancel
      </button>
      <button class="rounded-lg bg-[#ED7D3A] px-4 py-2 text-sm font-medium" @click="handleConfirm">
        Submit
      </button>
    </div>
  </div>
</template>

<style scoped></style>
