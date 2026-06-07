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
  <div class="bg-[#0CCE6B] px-3.75 py-5 rounded-[25px]">
    <img :src="imgPlaceholder" alt="placholder image">
    <div class="flex mt-2.5">
      <p class="text-[19px]">{{ stockName }}</p>
      <div class="flex ml-auto items-center">
        <div class="w-6.25 h-6.25 bg-red-600 rounded-[50%] mr-2.75"></div>
        <p class="text-[19px]">Low</p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>