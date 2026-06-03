<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  "title": {
    type: String,
    required: true
  },
  "content": {
    type: Object,
    required: true
  },
  "tableColor": {
    type: String,
    required: true
  },
});

const colSpanClass = computed(() => {
  const count = Object.keys(props.content).length;

  const map: { [key: number]: string } = {
    2: 'col-span-2',
    3: 'col-span-3',
  };

  return map[count] || 'col-span-1';
});
</script>

<template>
  <div class="grid rounded-[20px] overflow-hidden">
    <div class="flex justify-center font-bold text-[20px] items-center" :class="[colSpanClass, `bg-[${tableColor}]`]">{{ title }}</div>
    <div v-for="contentHeader in Object.keys(content)"
      class="odd:bg-white even:bg-white text-[20px] flex justify-center items-center" :class="`text-[${tableColor}]`">{{
        contentHeader }}</div>
    <template v-for="(firstColContent, i) in content[Object.keys(content)[0]]">
      <template v-if="typeof i === 'string'"></template>
      <template v-else>
        <template v-if="i % 2 === 0">
          <div class="bg-[#A3A1A52E] text-[20px] flex justify-center items-center">{{ firstColContent }}</div>
          <template v-for="header in Object.keys(content).slice(1)">
            <div class="bg-[#A3A1A52E] text-[20px] flex justify-center items-center">{{ content[header][i] }}</div>
          </template>
        </template>
        <template v-else>
          <div class="bg-white text-[20px] flex justify-center items-center">{{ firstColContent }}</div>
          <template v-for="header in Object.keys(content).slice(1)">
            <div class="bg-white text-[20px] flex justify-center items-center">{{ content[header][i] }}</div>
          </template>
        </template>
      </template>
    </template>
  </div>
</template>

<style scoped></style>
