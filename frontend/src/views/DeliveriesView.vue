<script setup lang="ts">
import InteractiveTable from '@/components/InteractiveTable.vue';
import { useDeliveries } from '@/composables/useDelivery';
import { computed, onMounted, ref, watch } from 'vue';

const receiveDeliveries = ref([]);

const tooLargeContent = ref(false);
const curPage = ref(1);

const { deliveries, pagination: deliveriesPagination, isLoading: deliveriesLoading, error: deliveriesError, fetchDeliveries } = useDeliveries();
let isFirst = true;
let dateRequested = [];
let branch = [];
let dateReceived = [];

const translatedDeliveries = computed(() => {
  receiveDeliveries.value = deliveries.value.map((delivery, i) => !delivery.delivered ? i : null);
  dateRequested.push(...deliveries.value.map(delivery => new Date(delivery.dateRequested).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })));
  branch.push(...deliveries.value.map(delivery => delivery.branchDetails.name));
  dateReceived.push(...deliveries.value.map(delivery => delivery.dateRequested));
  return {
    "Date Requested": dateRequested,
    "Branch": branch,
    "Date Receive": dateReceived
  };
});

watch(translatedDeliveries, _ => {
  if (isFirst && deliveriesPagination.value.totalItems > 10) {
    tooLargeContent.value = true;
    fetchDeliveries(curPage.value, 10);
    isFirst = false;
  }
});

const handle = (_: string) => {
  if (curPage.value <= deliveriesPagination.value.totalPages) {
    curPage.value += 1;
  }
};

watch(curPage, async (newCurPage) => {
  if (newCurPage < 3) return;
  fetchDeliveries(newCurPage, 10);
});

onMounted(() => {
  fetchDeliveries(curPage.value, 10);
  curPage.value += 1;
});
</script>

<template>
  <div class="px-29.5 py-16.75 h-full">
    <div v-show="!deliveriesLoading">
      <InteractiveTable table-color="0CCE6B" :content="translatedDeliveries" :interactive-columns="['Date Receive']"
        class="grid-cols-3 auto-rows-[9.089%] h-212.5" :-row-amt="10"
        :class="{ 'overflow-y-scroll': tooLargeContent, 'overflow-hidden': !tooLargeContent }" @seen="handle"
        :next-page-i="10">
        <template v-for="(deliveryReceived, i) in translatedDeliveries['Date Receive']" #[`row-${i}`]>
          <button v-if="receiveDeliveries.includes(i)" @click="receiveDelivery(deliveryIds[i], i)">Receive</button>
          <p v-else>{{ new Date(deliveryReceived).toLocaleDateString("en-PH", {
            year: "numeric", month: "long", day:
              "numeric"
          }) }}</p>
        </template>
      </InteractiveTable>
    </div>
  </div>
</template>

<style scoped></style>
