<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import InteractiveTable from '@/components/InteractiveTable.vue';
import { useSales } from '@/composables/useSale';

const route = useRoute();

const tooLargeContent = ref(false);
const saleId = computed(() => route.params.saleId as string);

const { sale, isLoading, error, fetchSale, voidSale } = useSales();

const formatPrice = (value: number) =>
  value.toLocaleString("en-PH", { style: "currency", currency: "PHP" });

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });

const translatedSaleItems = computed(() => {
  if (sale.value === undefined) return { "Stock Name": [], Quantity: [], Price: [], Amount: [] };
  return {
    "Stock Name": sale.value.items.map(item => item.stock_name ?? item.stock_id),
    Quantity: sale.value.items.map(item => item.quantity),
    Price: sale.value.items.map(item => formatPrice(item.unitPrice)),
    Amount: sale.value.items.map(item => formatPrice(item.quantity * item.unitPrice)),
  };
});

const handle = (_: string) => { };

const handleVoid = async () => {
  await voidSale(saleId.value);
  await fetchSale(saleId.value);
};

watch(sale, newSale => {
  if ((newSale?.items.length ?? 0) > 10) {
    tooLargeContent.value = true;
  }
});

onMounted(() => {
  fetchSale(saleId.value);
});
</script>

<template>
  <div class="p-5 h-[calc(100vh-140px)]">
    <div v-if="sale !== undefined" class="flex items-center mb-2 gap-4">
      <p class="text-[14px] font-bold">{{ sale.branchDetails?.name ?? "" }}</p>
      <p class="text-[12px]">{{ formatDate(sale.dateSold) }}</p>
      <p class="text-[12px]">{{ sale.voided ? "Voided" : "Active" }}</p>
      <p class="text-[14px] font-bold ml-auto">Total: {{ formatPrice(sale.total) }}</p>
    </div>
    <p v-if="error !== null" class="text-[12px] text-[#EF2D56] mb-2">{{ error }}</p>
    <InteractiveTable v-show="!isLoading" table-color="#0CCE6B" :content="translatedSaleItems"
      :interactive-columns="[]" class="grid-cols-4 auto-rows-[9.089%] h-full" :-row-amt="10"
      :class="{ 'overflow-y-scroll': tooLargeContent, 'overflow-hidden': !tooLargeContent }" @seen="handle"
      :next-page-i="10" />
    <div class="flex justify-center mt-2.25">
      <button v-if="sale !== undefined && !sale.voided" class="bg-[#EF2D56] text-white px-3.75 py-1.5 rounded-[5px]"
        @click="handleVoid">Void Sale</button>
    </div>
  </div>
</template>

<style scoped></style>
