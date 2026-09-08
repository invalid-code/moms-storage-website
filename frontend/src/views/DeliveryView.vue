<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import InteractiveTable from '@/components/InteractiveTable.vue';
import { useDeliveries } from '@/composables/useDelivery';
import type { StocksReceivedDTO, UpdateDeliverySelectivelyDTO } from '@my-app/types';

const route = useRoute();

const tooLargeContent = ref(false);
const deliveryId = computed(() => route.params.deliveryId as string);
const deliveryStocksId = computed(() => delivery.value?.stocksRequested.map(stockRequested => stockRequested._id ?? "") ?? []);

const { delivery, isLoading, error, fetchDelivery, patchDelivery } = useDeliveries();
const updatedDelivery = ref<UpdateDeliverySelectivelyDTO>({ delivered: true, dateDelivered: new Date().toISOString(), stocksReceived: [] });
const deliveryStockAmounts = ref<number[]>([]);

const translatedDelivery = computed(() => {
  if (delivery.value === undefined) return { "Stock Name": [], Amount: [] };
  return { "Stock Name": delivery.value.stocksRequested.map(stockRequested => stockRequested.name), Amount: [] };
});

const handle = (_: string) => { };

const updateDelivery = () => {
  updatedDelivery.value.stocksReceived = deliveryStockAmounts.value.map<StocksReceivedDTO>((deliveryStockAmount, i: number) => ({ stockId: deliveryStocksId.value[i] ?? "", amount: deliveryStockAmount }));
  patchDelivery(deliveryId.value, updatedDelivery.value);
};

watch(delivery, newDelivery => {
  if ((newDelivery?.stocksRequested.length ?? 0) > 10) {
    tooLargeContent.value = true;
  }
});

onMounted(() => {
  fetchDelivery(deliveryId.value);
});
</script>

<template>
  <div class="p-5 h-[calc(100vh-140px)]">
    <InteractiveTable v-show="!isLoading" table-color="#0CCE6B" :content="translatedDelivery"
      :interactive-columns="['Amount']" class="grid-cols-2 auto-rows-[9.089%] h-full" :-row-amt="10"
      :class="{ 'overflow-y-scroll': tooLargeContent, 'overflow-hidden': !tooLargeContent }" @seen="handle"
      :next-page-i="10">
      <template v-for="(_, i) in translatedDelivery['Stock Name']" #[`row-${i}`]>
        <input type="number" v-model="deliveryStockAmounts[i]" />
      </template>
    </InteractiveTable>
    <div class="flex justify-center mt-2.25">
      <button class="bg-[#ED7D3A] px-3.75 py-1.5 rounded-[5px]" @click="updateDelivery">Submit</button>
    </div>
  </div>
</template>

<style scoped></style>
