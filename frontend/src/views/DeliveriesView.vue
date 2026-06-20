<script setup lang="ts">
import InteractiveTable from '@/components/InteractiveTable.vue';
import { useDeliveries, useDelivery, usePatchDelivery } from '@/composables/useDelivery';
import { onMounted, ref, watch } from 'vue';

const receiveDeliveries = ref([]);

// const isDeliveriesLoading = ref(true);
// const deliveryIds = ref([]);
const tooLargeContent = ref(false);
const nextPageI = ref(0);

const { deliveries, isLoading: deliveriesLoading, error: deliveriesError, fetchDeliveries } = useDeliveries();
const { delivery, isLoading: deliveryLoading, error: deliveryError, fetchDelivery } = useDelivery();
const {isLoading: patchDeliveryLoading, error: patchDeliveryError, patchDelivery} = usePatchDelivery();

const handle = (_: string) => {
  nextPageI.value += 1;
};

watch(nextPageI, async (newNextPageI) => {
  if (newNextPageI < 3) return;
  fetchDeliveries(newNextPageI, 10);
});

onMounted(() => {
  fetchDeliveries(1, 10);
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
