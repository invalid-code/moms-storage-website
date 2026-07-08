<script setup lang="ts">
const props = defineProps({
  "title": {
    type: String,
    required: true
  },
  "tableColor": {
    type: String,
    required: true
  }
});
</script>

<template>
  <div class="bg-white rounded-[25px] overflow-hidden">
    <div class="flex justify-center items-center bg-(--tableColor)" :style="{'--tableColor': tableColor}">
      <h1 class="font-bold text-[16px] whitespace-nowrap">{{ title }}</h1>
    </div>
    <div v-for="i in Array.from({length: 3}, (_, i) => 0 + i)">
      <slot :name="`row-${i}`"></slot>
    </div>
  </div>
</template>

<style scoped></style>