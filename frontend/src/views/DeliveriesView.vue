<script setup lang="ts">
import InteractiveTable from '@/components/InteractiveTable.vue';
import { useBranches } from '@/composables/useBranch';
import { useDeliveries } from '@/composables/useDelivery';
import { computed, onMounted, ref, watch } from 'vue';


const receiveDeliveries = ref<number[]>([]);
const curSelectedBranch = ref("");
const tooLargeContent = ref(false);
const curPage = ref(1);
let deliveriesI = 0;

const { branches, isLoading: branchesLoading, error: branchesError, fetchBranches } = useBranches();
const { deliveries, pagination: deliveriesPagination, isLoading: deliveriesLoading, error: deliveriesError, fetchDeliveries } = useDeliveries();
let isFirst = true;
const deliveriesId = ref([]);

watch(deliveries, newDeliveries => {
  receiveDeliveries.value.push(...newDeliveries.map(delivery => {
    const indToRet = !delivery.delivered ? deliveriesI : null;
    deliveriesI += 1;
    return indToRet;
  }).filter(i => i !== null));
  deliveriesId.value.push(...newDeliveries.map(delivery => delivery._id));
  if (isFirst && deliveriesPagination.value.totalItems > 10) {
    tooLargeContent.value = true;
    fetchDeliveries(curPage.value, 10, '');
    isFirst = false;
  }
});

const translatedDeliveries = computed(() => {
  return {
    "Date Requested": deliveries.value.map(delivery => new Date(delivery.dateRequested).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })),
    Branch: deliveries.value.map(delivery => delivery.branchDetails.name),
    "Date Receive": deliveries.value.map(delivery => new Date(delivery.dateDelivered).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }))
  };
});

const handle = (_: string) => {
  if (curPage.value <= deliveriesPagination.value.totalPages) {
    curPage.value += 1;
  }
};

watch(curPage, async (newCurPage) => {
  if (newCurPage < 3) return;
  fetchDeliveries(newCurPage, 10, curSelectedBranch.value);
});

watch(curSelectedBranch, (newCurSelectedBranch) => {
  isFirst = true;
  curPage.value = 1;

  fetchDeliveries(curPage.value, 10, newCurSelectedBranch);

  curPage.value += 1;
});

onMounted(() => {
  fetchDeliveries(curPage.value, 10, curSelectedBranch.value);
  curPage.value += 1;
  fetchBranches();
});
</script>

<template>
  <div class="p-5 h-[calc(100vh-100px)]">
    <InteractiveTable v-show="!deliveriesLoading" table-color="#0CCE6B" :content="translatedDeliveries"
      :interactive-headers="['Branch']" :interactive-columns="['Date Receive']"
      class="grid-cols-3 auto-rows-[9.089%] h-full" :-row-amt="10"
      :class="{ 'overflow-y-scroll': tooLargeContent, 'overflow-hidden': !tooLargeContent }" @seen="handle"
      :next-page-i="10">
      <template v-for="header in ['Branch']" #[`headers-${header}`]>
        <select v-show="!branchesLoading" v-model="curSelectedBranch">
          <option value="">Branch</option>
          <option v-for="branch in branches" :value="branch._id">{{ branch.name.toUpperCase() }}</option>
        </select>
      </template>
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
