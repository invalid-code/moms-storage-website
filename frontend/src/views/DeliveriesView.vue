<script setup lang="ts">
import InteractiveTable from '@/components/InteractiveTable.vue';
import { onMounted, ref, watch } from 'vue';

const receiveDeliveries = ref([]);

const isDeliveriesLoading = ref(true);
const error = ref("");
const deliveries = ref({});
const deliveryIds = ref([]);
const tooLargeContent = ref(false);
const nextPageI = ref(0);

const getDeliveries = async (page = 1, limit = 10) => {
  try {
    nextPageI.value += 1
    isDeliveriesLoading.value = true;
    error.value = "";

    const response = await fetch(`http://localhost:5000/api/delivery?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    deliveryIds.value = result.data.map((delivery) => delivery._id);
    deliveries.value = {
      "Date Requested": result.data.map((delivery) => new Date(delivery.dateRequested).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })),
      "Branch": result.data.map((delivery) => delivery.branchDetails.name),
      "Date Receive": result.data.map((delivery) => delivery.dateDelivered),
    };
    receiveDeliveries.value = result.data.map((delivery, i) => !delivery.delivered ? i : null);
    if (result.pagination.totalItems > 10) {
      nextPageI.value += 1
      tooLargeContent.value = true;

      const secondPageResponse = await fetch(`http://localhost:5000/api/delivery?page=${page + 1}&limit=${limit}`);
      if (!secondPageResponse.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const secondPageRes = await secondPageResponse.json();
      deliveries.value["Date Requested"].push(...(secondPageRes.data.map(delivery => new Date(delivery.dateRequested).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }))));
      deliveries.value["Date Receive"].push(...(secondPageRes.data.map(delivery => delivery.dateDelivered)));
      deliveries.value.Branch.push(...(secondPageRes.data.map(delivery => delivery.branchDetails.name)));
      receiveDeliveries.value.push(...secondPageRes.data.map((delivery, i) => !delivery.delivered ? receiveDeliveries.value.length + i : null));
    }
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

const receiveDelivery = async (id: string, deliveryI: number) => {
  try {
    isDeliveriesLoading.value = true;
    error.value = "";

    const data = {
      delivered: true,
      dateDelivered: new Date(),
    }

    const response = await fetch(`http://localhost:5000/api/delivery/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    deliveries.value["Date Receive"][deliveryI] = result.data.dateDelivered;
    receiveDeliveries.value = receiveDeliveries.value.filter(receiveDelivery => receiveDelivery !== deliveryI);
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

const handle = (_: string) => {
  nextPageI.value += 1;
};

watch(nextPageI, async (newNextPageI) => {
  if (newNextPageI < 3) return;
  try {
    // isBranchStocksLoading.value = true;
    error.value = "";

    const response = await fetch(`http://localhost:5000/api/delivery?page=${newNextPageI}&limit=10`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    deliveries.value["Date Requested"].push(...(result.data.map(delivery => new Date(delivery.dateRequested).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }))));
    deliveries.value["Date Receive"].push(...(result.data.map(delivery => delivery.dateDelivered)));
    deliveries.value.Branch.push(...(result.data.map(delivery => delivery.branchDetails.name)));
    receiveDeliveries.value.push(...result.data.map((delivery, i) => !delivery.delivered ? receiveDeliveries.value.length + i : null));
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
  getDeliveries();
});
</script>

<template>
  <div class="px-29.5 py-16.75 h-full">
    <template v-if="!isDeliveriesLoading">
      <InteractiveTable table-color="0CCE6B" :content="deliveries" :interactive-columns="['Date Receive']"
        class="grid-cols-3 auto-rows-[9.089%] h-212.5" :-row-amt="10"
        :class="{ 'overflow-y-scroll': tooLargeContent, 'overflow-hidden': !tooLargeContent }" @seen="handle"
        :next-page-i="10">
        <template v-for="(deliveryReceived, i) in deliveries['Date Receive']" #[`row-${i}`]>
          <button v-if="receiveDeliveries.includes(i)" @click="receiveDelivery(deliveryIds[i], i)">Receive</button>
          <p v-else>{{ new Date(deliveryReceived).toLocaleDateString("en-PH", {
            year: "numeric", month: "long", day:
              "numeric"
          }) }}</p>
        </template>
      </InteractiveTable>
    </template>
  </div>
</template>

<style scoped></style>
