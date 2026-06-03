<script setup lang="ts">
import BranchesDropdown from '@/components/BranchesDropdown.vue';
import Table from '@/components/Table.vue';

const lowStocksContent = {
  "Stock Name": ["Stock Name", "Stock Name", "Stock Name", "Stock Name"],
  "Stock Amount": ["Stock Amount Delimination", "Stock Amount Delimination", "Stock Amount Delimination", "Stock Amount Delimination"]
};
const stocksContent = {
  "Stock Name": ["Stock Name", "Stock Name", "Stock Name", "Stock Name", "Stock Name", "Stock Name", "Stock Name", "Stock Name", "Stock Name"],
  "Stock Amount": ["Stock Amount Delimination", "Stock Amount Delimination", "Stock Amount Delimination", "Stock Amount Delimination", "Stock Amount Delimination", "Stock Amount Delimination", "Stock Amount Delimination", "Stock Amount Delimination", "Stock Amount Delimination"]
};
const deliveriesContent = {
  "Delivery Status": ["Delivery Status", "Delivery Status", "Delivery Status", "Delivery Status"],
  "Date Requested": ["Date Requested", "Date Requested", "Date Requested", "Date Requested"],
  "Date Received": ["Date Received", "Date Received", "Date Received", "Date Received"]
};
</script>

<template>
  <div class="py-18.5 px-24 h-full">
    <BranchesDropdown class="mb-7" />
    <div class="grid grid-cols-2 gap-x-10.75 gap-y-10.5 h-full">
      <Table title="Low Stocks" :content="lowStocksContent" class="grid-cols-2" table-color="#EF2D56"/>
      <Table title="Stocks" :content="stocksContent" class="grid-cols-2 row-span-2" table-color="#0CCE6B"/>
      <Table title="Deliverables" :content="deliveriesContent" class="grid-cols-3" table-color="#ED7D3A"/>
    </div>
  </div>
</template>

<style scoped></style>
