<script setup lang="ts">
import InteractiveTable from '@/components/InteractiveTable.vue';

const content = {
  "Date Requested": ["Date Requested", "Date Requested", "Date Requested", "Date Requested", "Date Requested", "Date Requested", "Date Requested", "Date Requested", "Date Requested", "Date Requested"],
  "Branch": ["Branch", "Branch", "Branch", "Branch", "Branch", "Branch", "Branch", "Branch", "Branch", "Branch"],
  "Date Receive": [],
};
const receiveDeliveries = [0, 1];
</script>

<template>
  <div class="px-29.5 py-16.75 h-full">
    <InteractiveTable table-color="0CCE6B" :content="content" :interactive-columns="['Date Receive']" class="grid-cols-3">
      <template v-for="i in Array.from({length: 10}, (_, i) => i + 0)" #[`row-${i}`]>
        <button v-if="receiveDeliveries.includes(i)">Receive</button>
        <p v-else>Date Received</p>
      </template>
    </InteractiveTable>
  </div>
</template>

<style scoped></style>
