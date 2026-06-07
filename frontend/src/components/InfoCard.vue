<script setup lang="ts">
const props = defineProps({
  "title": {
    type: String,
    required: true
  },
  // "content": {
  //   type: Object,
  //   required: true
  // },
  "tableColor": {
    type: String,
    required: true
  }
});
</script>

<template>
  <div class="bg-white rounded-[25px] overflow-hidden">
    <div class="flex justify-center items-center px-14 py-3" :class="`bg-[#${tableColor}]`">
      <h1 class="font-bold text-[25px] whitespace-nowrap">{{ title }}</h1>
    </div>
    <div v-for="i in Array.from({length: 3}, (_, i) => 0 + i)">
      <slot :name="`row-${i}`"></slot>
    </div>
  </div>
</template>

<style scoped></style>