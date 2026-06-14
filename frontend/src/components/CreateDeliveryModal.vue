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

const stocksId = ref([]);
const selectedStocks = ref([]);
const stocks = ref({});
const interactiveColumns = ["Stock Name"];
const curSelectedBranch = ref("6a22d28e5882d14a0b85c54b"); // todo: when first load get the default selected value

const getStocks = async (page = 1, limit = 10) => {
  try {
    isStocksLoading.value = true;
    error.value = "";
    const response = await fetch(`http://localhost:5000/api/item?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    stocks.value["Stock Name"] = result.data.map((stock) => stock.name);
    stocksId.value = result.data.map((stock) => stock._id);
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

onMounted(() => {
  getStocks(1, 5);
});
</script>

<template>
  <div v-if="isOpen" class="fixed top-20 left-[77%] z-50 flex items-center justify-center p-4">
    <div class="rounded-xl bg-white p-6">
      <BranchesDropdown :default-value="curSelectedBranch" />
      <template v-if="!isStocksLoading">
        <InteractiveTable table-color="0CCE6B" :content="stocks" :interactive-columns="interactiveColumns"
          :-row-amt="5">
          <template v-for="i in Array.from({ length: 5 }, (_, i) => 0 + i)" #[`row-${i}`]>
            <div class="w-full" @click="() => !selectedStocks.includes(stocksId[i]) ? selectedStocks.push(stocksId[i]) : null">
              {{ stocks["Stock Name"][i] }}
            </div>
          </template>
        </InteractiveTable>
      </template>
      <button class="rounded-lg bg-[#DCED31] px-4 py-2 text-sm font-medium" @click="emit('close')">
        Cancel
      </button>
      <button class="rounded-lg bg-[#ED7D3A] px-4 py-2 text-sm font-medium" @click="handleConfirm">
        Submit
      </button>
    </div>
  </div>
</template>

<style scoped></style>
