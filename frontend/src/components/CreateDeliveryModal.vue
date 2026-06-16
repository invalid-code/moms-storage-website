<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import BranchesDropdown from './BranchesDropdown.vue';
import InteractiveTable from './InteractiveTable.vue';

const emit = defineEmits(['close']);

defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});
const isStocksLoading = ref(true);
const isOrderDeliveryLoading = ref(true);
const error = ref("");
const tooLargeContent = ref(false);
const stocksId = ref([]);
const selectedStocks = ref([]);
const stocks = ref({});
const interactiveColumns = ["Stock Name"];
const curSelectedBranch = ref("6a22d28e5882d14a0b85c54b"); // todo: when first load get the default selected value
const nextPageI = ref(0);

const handleConfirm = async () => {
  try {
    isOrderDeliveryLoading.value = true;
    error.value = "";

    const data = {
      branchId: curSelectedBranch.value,
      stocksRequested: selectedStocks.value,
    }
    const response = await fetch(`http://localhost:5000/api/delivery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = `An unexpected error occurred: ${err}`;
    }
  } finally {
    isOrderDeliveryLoading.value = false;
  }
  emit("close");
};

const getStocks = async (page = 1, limit = 10) => {
  try {
    isStocksLoading.value = true;
    error.value = "";
    nextPageI.value += 1;
    const response = await fetch(`http://localhost:5000/api/item?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    stocks.value["Stock Name"] = result.data.map((stock) => stock.name);
    stocksId.value = result.data.map((stock) => stock._id);
    if (result.pagination.totalItems > 5) {
      nextPageI.value += 1;
      tooLargeContent.value = true;

      const secondPageResponse = await fetch(`http://localhost:5000/api/item?page=${page + 1}&limit=5`);
      if (!secondPageResponse.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const secondPageRes = await secondPageResponse.json();
      stocks.value["Stock Name"].push(...(secondPageRes.data.map(item => item.name)));
      stocksId.value = secondPageRes.data.map((stock) => stock._id);
    }
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = `An unexpected error occurred: ${err}`;
    }
  } finally {
    isStocksLoading.value = false;
  }
};

const handle = (_: string) => {
  nextPageI.value += 1;
};

watch(nextPageI, async (newNextPageI) => {
  if (newNextPageI < 3) return;
  try {
    // isBranchStocksLoading.value = true;
    error.value = "";

    const response = await fetch(`http://localhost:5000/api/item?page=${newNextPageI}&limit=5`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    stocks.value["Stock Name"].push(...(result.data.map(item => item.name)));
    stocksId.value = result.data.map((stock) => stock._id);
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = `An unexpected error occurred: ${err}`;
    }
  } finally {
    // isBranchStocksLoading.value = false;
  }
});

onMounted(() => {
  getStocks(1, 5);
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
