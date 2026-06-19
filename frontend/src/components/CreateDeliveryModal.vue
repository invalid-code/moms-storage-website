<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
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

const isStocksLoading = ref(true);
const tooLargeContent = ref(false);
const stocksId = ref([]);
const selectedStocks = ref([]);
const stocks = ref({});
const interactiveColumns = ["Stock Name"];
const curSelectedBranch = ref("6a22d28e5882d14a0b85c54b"); // todo: when first load get the default selected value
const nextPageI = ref(0);

const { isLoading: createDeliveryLoading, error: createDeliveryError, createDelivery } = useCreateDelivery();
const { medicineRecords, isLoading: medicineLoading, error: medicineError, fetchMedicineRecords } = useMedicineRecords();

const handleConfirm = async () => {
  const data = {
    branchId: curSelectedBranch.value,
    stocksRequested: selectedStocks.value,
  }
  createDelivery(data);
  emit("close");
};

const handle = (_: string) => {
  nextPageI.value += 1;
};

watch(nextPageI, async (newNextPageI) => {
  if (newNextPageI < 3) return;
  fetchMedicineRecords(newNextPageI, 5, "");
});

onMounted(() => {
  fetchMedicineRecords(1, 5, "");
});
</script>

<template>
  <div v-if="isOpen" class="fixed top-20 left-[77%] z-50 flex items-center justify-center p-4">
    <div class="rounded-xl bg-white p-6">
      <BranchesDropdown class="mb-5" :default-value="curSelectedBranch" @cur-selected="" />
      <InteractiveTable v-if="!isStocksLoading" class="auto-rows-[16.5%] h-60 mb-5" table-color="0CCE6B"
        :content="stocks" :interactive-columns="interactiveColumns" :-row-amt="5" @seen="handle"
        :class="{ 'overflow-y-scroll': tooLargeContent, 'overflow-hidden': !tooLargeContent }" :next-page-i="5">
        <template v-for="i in Array.from({ length: stocks['Stock Name'].length }, (_, i) => 0 + i)" #[`row-${i}`]>
          <div class="w-full flex justify-center" :class="{ 'bg-[#55555580]': selectedStocks.includes(stocksId[i]) }"
            @click="() => !selectedStocks.includes(stocksId[i]) ? selectedStocks.push(stocksId[i]) : selectedStocks = selectedStocks.filter(selectedStock => selectedStock !== stocksId[i])">
            {{ stocks["Stock Name"][i] }}
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
