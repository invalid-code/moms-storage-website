<script setup lang="ts">
import InteractiveTable from '@/components/InteractiveTable.vue';
import { useDeliveries, usePatchDelivery } from '@/composables/useDelivery';
import { computed, onMounted, ref, watch } from 'vue';


const receiveDeliveries = ref([]);

const tooLargeContent = ref(false);
const curPage = ref(1);
let deliveriesI = 0;

const { deliveries, pagination: deliveriesPagination, isLoading: deliveriesLoading, error: deliveriesError, fetchDeliveries } = useDeliveries();
let isFirst = true;
let dateRequested = [];
let branch = [];
let dateReceived = [];
const deliveriesId = ref([]);

const translatedDeliveries = computed(() => {
  receiveDeliveries.value.push(...deliveries.value.map(delivery => {
    const indToRet = !delivery.delivered ? deliveriesI : null;
    deliveriesI += 1;
    return indToRet;
  }).filter(i => i !== null));
  deliveriesId.value.push(...deliveries.value.map(delivery => delivery._id));
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
  <div class="p-5 h-[calc(100vh-100px)]">
    <InteractiveTable v-show="!deliveriesLoading" table-color="#0CCE6B" :content="translatedDeliveries"
      :interactive-columns="['Date Receive']" class="grid-cols-3 auto-rows-[9.089%] h-full" :-row-amt="10"
      :class="{ 'overflow-y-scroll': tooLargeContent, 'overflow-hidden': !tooLargeContent }" @seen="handle"
      :next-page-i="10">
      <template v-for="(deliveryReceived, i) in translatedDeliveries['Date Receive']" #[`row-${i}`]>
        <router-link :to="{ name: 'delivery', params: { deliveryId: deliveriesId[i] } }"
          v-if="receiveDeliveries.includes(i)">Receive</router-link>
        <p v-else>{{ new Date(deliveryReceived).toLocaleDateString("en-PH", {
          year: "numeric", month: "long", day:
            "numeric"
        }) }}</p>
      </template>
    </InteractiveTable>
  </div>
</template>

<style scoped></style>
