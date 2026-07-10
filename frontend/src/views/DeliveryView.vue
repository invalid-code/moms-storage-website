<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import InteractiveTable from '@/components/InteractiveTable.vue';
import { useDeliveries } from '@/composables/useDelivery';

const route = useRoute();

const tooLargeContent = ref(false);
const deliveryId = computed(() => route.params.deliveryId);

const { deliveries: delivery, isLoading, error, fetchDelivery, patchDelivery } = useDeliveries();
const updatedDelivery = ref({delivered: true, dateDelivered: new Date()});

const translatedDelivery = computed(() => {
  if (delivery.value.length === 0) {
    return { "Stock Name": [], Amount: [] };
  }
  return { "Stock Name": delivery.value[0].stocksRequested.map(stockRequested => stockRequested.name), Amount: [] };
});

const handle = (_: string) => { };

watch(delivery, newDelivery => {
  if (newDelivery[0].stocksRequested.length > 10) {
    tooLargeContent.value = true;
  }
});

onMounted(() => {
  fetchDelivery(deliveryId.value);
});
</script>

<template>
  <div class="p-5 h-[calc(100vh-100px)]">
    <InteractiveTable v-show="!isLoading" table-color="#0CCE6B" :content="translatedDelivery"
      :interactive-columns="['Amount']" class="grid-cols-2 auto-rows-[9.089%] h-full" :-row-amt="10"
      :class="{ 'overflow-y-scroll': tooLargeContent, 'overflow-hidden': !tooLargeContent }" @seen="handle"
      :next-page-i="10">
      <template v-for="(_, i) in translatedDelivery['Stock Name']" #[`row-${i}`]>
        <input type="number" />
      </template>
    </InteractiveTable>
    <button @click="patchDelivery(deliveryId)">submit</button>
  </div>
</template>

<style scoped></style>
