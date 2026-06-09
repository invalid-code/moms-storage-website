<script setup lang="ts">
import InteractiveTable from '@/components/InteractiveTable.vue';
import { onMounted, ref, watch } from 'vue';

const interactiveColumns = ["Branch"];

const branches = ref(null);
const isBranchesLoading = ref(true);
const isLowStockLoading = ref(true);
const stocks = ref({});
const error = ref("");
const curSelectedBranch = ref("6a22d28e5882d14a0b85c54b"); // todo: when first load get the default selected value

const mainBranchDropdownSelected = (event: Event) => {
  curSelectedBranch.value = event.target.value;
};

const getAllBranches = async () => {
  try {
    isBranchesLoading.value = true;
    const response = await fetch(`http://localhost:5000/api/branch`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    branches.value = await response.json();
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = `An unexpected error occurred: ${err}`;
    }
  } finally {
    isBranchesLoading.value = false;
  }
};

const getBranchStocks = async (selectedBranchId: string, page = 1, limit = 10) => {
  try {
    isLowStockLoading.value = true;
    error.value = "";

    const response = await fetch(`http://localhost:5000/api/branch/${selectedBranchId}?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    stocks.value = {
      "Stock Name": result.data.map((stock) => stock["stock-name"]),
      "Branch": [],
      "Quantity": result.data.map((stock) => stock.stock_onhold_amount)
    }
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = `An unexpected error occurred: ${err}`;
    }
  } finally {
    isLowStockLoading.value = false;
  }
};

watch(curSelectedBranch, (newCurSelectedBranch) => {
  getBranchStocks(newCurSelectedBranch, 1, 10);
});

onMounted(() => {
  getAllBranches();
  getBranchStocks(curSelectedBranch.value, 1, 10);
});
</script>

<template>
  <div class="px-29.5 py-16.75 h-full">
    <InteractiveTable table-color="0CCE6B" :interactive-columns="interactiveColumns" :content="stocks"
      class="grid-cols-3 grid-rows-10" :interactive-headers="interactiveColumns">
      <template v-for="header in interactiveColumns" #[`headers-${header}`] @change="mainBranchesDropdownEmitHandler">
        <select @change="mainBranchDropdownSelected">
          <template v-if="!isBranchesLoading">
            <option v-for="branch in branches" :value="branch._id">{{ branch.name.toUpperCase() }}</option>
          </template>
        </select>
      </template>
      <template v-for="i in Array.from({ length: 10 + 1 }, (_, i) => 0 + i)" #[`row-${i}`]>
        <select>
          <template v-if="!isBranchesLoading">
            <template v-for="branch in branches">
              <template v-if="branch._id === curSelectedBranch">
                <option selected :value="branch._id">{{ branch.name.toUpperCase() }}</option>
              </template>
              <template v-else>
                <option :value="branch._id">{{ branch.name.toUpperCase() }}</option>
              </template>
            </template>
          </template>
        </select>
      </template>
    </InteractiveTable>
  </div>
</template>

<style scoped></style>
