<script setup lang="ts">
import imgPlaceholder from '../assets/image.png'

const props = defineProps({
  "stockName": {
    type: String,
    required: true
  },
});
</script>

<template>
  <div class="bg-[#0CCE6B] p-3 rounded-[25px] flex flex-col items-center">
    <img class="max-h-18.75 max-w-18.75" :src="imgPlaceholder" alt="placholder image">
    <div class="flex mt-1.5 w-full">
      <p class="text-[9px]">{{ stockName }}</p>
      <div class="flex ml-auto items-center">
        <div class="w-2.5 h-2.5 bg-red-600 rounded-[50%] mr-0.5"></div>
        <p class="text-[9px]">Low</p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>