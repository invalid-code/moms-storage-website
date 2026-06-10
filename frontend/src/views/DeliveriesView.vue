<script setup lang="ts">
import InteractiveTable from '@/components/InteractiveTable.vue';
import { onMounted, ref } from 'vue';

const receiveDeliveries = [0, 1];

const isDeliveriesLoading = ref(true);
const error = ref("");
const deliveries = ref({});

const getDeliveries = async (page = 1, limit = 10) => {
  try {
    isDeliveriesLoading.value = true;
    error.value = "";

    const response = await fetch(`http://localhost:5000/api/delivery?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    deliveries.value = {
      "Date Requested": result.data.map((delivery) => new Date(delivery.dateRequested).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })),
      "Branch": result.data.map((delivery) => delivery.branchDetails.name),
      "Date Receive": result.data.map((delivery) => delivery.dateDelivered),
    };
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = `An unexpected error occurred: ${err}`;
    }
  } finally {
    isDeliveriesLoading.value = false;
  }
};

onMounted(() => {
  getDeliveries();
});
</script>

<template>
  <div class="px-29.5 py-16.75 h-full">
    <template v-if="!isDeliveriesLoading">
      <InteractiveTable table-color="0CCE6B" :content="deliveries" :interactive-columns="['Date Receive']"
        class="grid-cols-3 grid-rows-11">
        <template v-for="(deliveryReceived, i) in deliveries['Date Receive']" #[`row-${i}`]>
          <button v-if="receiveDeliveries.includes(i)">Receive</button>
          <p v-else>{{ new Date(deliveryReceived).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) }}</p>
        </template>
      </InteractiveTable>
    </template>
  </div>
</template>

<style scoped></style>
