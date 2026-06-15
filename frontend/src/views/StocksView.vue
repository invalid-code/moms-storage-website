<script setup lang="ts">
import InteractiveTable from '@/components/InteractiveTable.vue';
import { onMounted, ref, watch } from 'vue';

const interactiveColumns = ["Branch"];

const branches = ref(null);
const isBranchesLoading = ref(true);
const isBranchStocksLoading = ref(true);
const stocksRes = ref([]);
const stocks = ref({});
const error = ref("");
const curSelectedBranch = ref("");
const curSelectedBranchRow = ref(new Array(10).fill(null));
const tooLargeContent = ref(false);
const nextPageI = ref(0);

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
    nextPageI.value += 1
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
    stocksRes.value = result.data;
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
    curSelectedBranchRow.value.push(...Array.from({length: result.data.length}, _ => null));
    if (result.pagination.totalItems > 10) {
      nextPageI.value += 1
      tooLargeContent.value = true;
      let secondPageUrl = "http://localhost:5000/api";

      if (selectedBranchId === "") {
        secondPageUrl += `/item?page=${page + 1}&limit=${limit}`;
      } else {
        secondPageUrl += `/branch/${selectedBranchId}?page=${page + 1}&limit=${limit}`;
      }
      const secondPageResponse = await fetch(secondPageUrl);
      if (!secondPageResponse.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const secondPageRes = await secondPageResponse.json();
      stocks.value["Stock Name"].push(...(secondPageRes.data.map(item => item.name)));
      stocks.value.Quantity.push(...(secondPageRes.data.map(item => item.count)));
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
      const response = await fetch(`http://localhost:5000/api/branch/${curSelectedBranchRow.value[row]}/stock/${stocksRes.value[row]._id}`);
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

const handle = (_: string) => {
  nextPageI.value += 1
};

watch(nextPageI, async (newNextPageI) => {
  if (newNextPageI < 3) return;
  try {
    // isBranchStocksLoading.value = true;
    error.value = "";

    let url = "http://localhost:5000/api";
    if (curSelectedBranch.value === "") {
      url += `/item?page=${nextPageI.value}&limit=10`;
    } else {
      url += `/branch/${curSelectedBranch.value}?page=${nextPageI.value}&limit=10`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    stocks.value["Stock Name"].push(...(result.data.map(item => item.name)));
    stocks.value.Quantity.push(...(result.data.map(item => item.count)));
    curSelectedBranchRow.value.push(...Array.from({length: result.data.length}, _ => null));
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
        class="grid-cols-3 auto-rows-[9.089%] h-212.5" :interactive-headers="interactiveColumns"
        :-row-amt="10" :class="{ 'overflow-y-scroll': tooLargeContent, 'overflow-hidden': !tooLargeContent}" @seen="handle">
        <template v-for="header in interactiveColumns" #[`headers-${header}`]>
          <select v-model="curSelectedBranch">
            <option value="">Choose a Branch</option>
            <template v-if="!isBranchesLoading">
              <option v-for="branch in branches" :value="branch._id">{{ branch.name.toUpperCase() }}</option>
            </template>
          </select>
        </template>
        <template v-for="i in Array.from({ length: stocks['Stock Name'].length }, (_, i) => 0 + i)" #[`row-${i}`]>
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
