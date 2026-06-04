<script setup lang="ts">
import InteractiveTable from '@/components/InteractiveTable.vue';

const content = {
  "Stock Name": ["Stock Name", "Stock Name", "Stock Name", "Stock Name", "Stock Name", "Stock Name", "Stock Name", "Stock Name", "Stock Name", "Stock Name"],
  "Branch": [],
  "Quantity": ["Quantity Denomination", "Quantity Denomination", "Quantity Denomination", "Quantity Denomination", "Quantity Denomination", "Quantity Denomination", "Quantity Denomination", "Quantity Denomination", "Quantity Denomination", "Quantity Denomination"]
};
const interactiveColumns = ["Branch"];
</script>

<template>
  <div class="px-29.5 py-16.75 h-full">
    <InteractiveTable table-color="0CCE6B" :interactive-columns="interactiveColumns" :content="content"
      class="grid-cols-3" :interactive-headers="interactiveColumns">
      <template v-for="header in interactiveColumns" #[`headers-${header}`]>
        <select>
          <option value="house">HOUSE</option>
          <option value="ccmc">CCMC</option>
          <option value="perpetual">PERPETUAL</option>
        </select>
      </template>
      <template v-for="i in Array.from({ length: 10 + 1 }, (_, i) => 0 + i)" #[`row-${i}`]>
        <select>
          <option value="house">HOUSE</option>
          <option value="ccmc">CCMC</option>
          <option value="perpetual">PERPETUAL</option>
        </select>
      </template>
    </InteractiveTable>
  </div>
</template>

<style scoped></style>
