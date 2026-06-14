<script setup lang="ts">
import InteractiveTable from '@/components/InteractiveTable.vue';
import { onMounted, ref, watch } from 'vue';

const interactiveColumns = ["Branch"];

const branches = ref(null);
const isBranchesLoading = ref(true);
const isBranchStocksLoading = ref(true);
const stocksRes = ref({});
const stocks = ref({});
const error = ref("");
const curSelectedBranch = ref("");
const curSelectedBranchRow = ref(new Array(10).fill(null));

const getAllBranches = async () => {
  try {
    isBranchesLoading.value = true;
    const response = await fetch("http://localhost:5000/api/branch");

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

const getBranchStocks = async (selectedBranchId = "", page = 1, limit = 10) => {
  try {
    isBranchStocksLoading.value = true;
    error.value = "";

    let url = "http://localhost:5000/api";
    if (selectedBranchId === "") {
      url += `/item?page=${page}&limit=${limit}`;
    } else {
      url += `/branch/${selectedBranchId}?page=${page}&limit=${limit}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    stocksRes.value = result;
    if (selectedBranchId === "") {
      stocks.value = {
        "Stock Name": result.data.map((stock) => stock.name),
        "Branch": [],
        "Quantity": result.data.map((stock) => stock.count)
      }
    } else {
      stocks.value = {
        "Stock Name": result.data.map((stock) => stock["stock-name"]),
        "Branch": [],
        "Quantity": result.data.map((stock) => stock.stock_onhold_amount)
      }
    }
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = `An unexpected error occurred: ${err}`;
    }
  } finally {
    isBranchStocksLoading.value = false;
  }
};

const getRowBranchStocks = async (row: number) => {
  try {
    isBranchStocksLoading.value = true;
    error.value = "";
    if (curSelectedBranchRow.value[row] === null) {
      const response = await fetch(`http://localhost:5000/api/item/${stocksRes.value.data[row]._id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      stocks.value["Stock Name"][row] = result.data.name;
      stocks.value["Quantity"][row] = result.data.count;
    }
    else {
      const response = await fetch(`http://localhost:5000/api/branch/${curSelectedBranchRow.value[row]}/stock/${stocksRes.value.data[row]._id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      stocks.value["Stock Name"][row] = result.data.stock_name;
      stocks.value["Quantity"][row] = result.data.stock_onhold_amount;
    }
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = `An unexpected error occurred: ${err}`;
    }
  } finally {
    isBranchStocksLoading.value = false;
  }
};

watch(curSelectedBranch, (newCurSelectedBranch) => {
  getBranchStocks(newCurSelectedBranch, 1, 10);

  if (newCurSelectedBranch !== "") {
    curSelectedBranchRow.value = curSelectedBranchRow.value.map((_) => newCurSelectedBranch);
  } else {
    curSelectedBranchRow.value = new Array(10).fill(null);
  }
});

onMounted(() => {
  getAllBranches();
  getBranchStocks("", 1, 10);
});
</script>

<template>
  <div class="px-29.5 py-16.75 h-full">
    <template v-if="!isBranchStocksLoading">
      <InteractiveTable table-color="0CCE6B" :interactive-columns="interactiveColumns" :content="stocks"
        class="grid-cols-3 grid-rows-11" :interactive-headers="interactiveColumns" :-row-amt="10">
        <template v-for="header in interactiveColumns" #[`headers-${header}`] @change="mainBranchesDropdownEmitHandler">
          <select v-model="curSelectedBranch">
            <option value="">Choose a Branch</option>
            <template v-if="!isBranchesLoading">
              <option v-for="branch in branches" :value="branch._id">{{ branch.name.toUpperCase() }}</option>
            </template>
          </select>
        </template>
        <template v-for="i in Array.from({ length: 10 }, (_, i) => 0 + i)" #[`row-${i}`]>
          <select v-model="curSelectedBranchRow[i]" @change="(() => getRowBranchStocks(i))">
            <option :value="null">Choose A Branch</option>
            <template v-if="!isBranchesLoading">
              <option v-for="branch in branches" :value="branch._id">{{
                branch.name.toUpperCase() }}</option>
            </template>
          </select>
        </template>
      </InteractiveTable>
    </template>
  </div>
</template>

<style scoped></style>
