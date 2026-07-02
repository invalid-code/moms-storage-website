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
  "maximum": {
    type: Number,
    required: true
  }
});

const columnAmt = computed(() => Object.keys(props.content).length);

const colSpanClass = computed(() => {

  const map: { [key: number]: string } = {
    2: 'col-span-2',
    3: 'col-span-3',
  };

  return map[columnAmt.value] || 'col-span-1';
});
</script>

<template>
  <div class="grid rounded-[20px] overflow-hidden">
    <div class="flex justify-center font-bold text-[20px] items-center" :class="colSpanClass"
      :style="{ backgroundColor: tableColor }">{{
        title }}</div>
    <div v-for="(contentHeader, i) in Object.keys(content)"
      class="odd:bg-white even:bg-white text-[20px] flex justify-center items-center border-b text-(--tableColor) border-(--tableColor)"
      :class="{ 'border-r': (i + 1) % columnAmt != 0 }" :style="{ '--tableColor': tableColor }">{{
        contentHeader }}</div>
    <template v-for="(firstColContent, i) in content[Object.keys(content)[0]]">
      <template v-if="typeof i === 'string'"></template>
      <template v-else>
        <div class="text-[20px] flex justify-center items-center border-(--tableColor)"
          :class="{ 'bg-white': !(i % 2 === 0), 'bg-[#A3A1A52E]': i % 2 === 0, 'border-r': Object.keys(content).length > 1 }"
          :style="{ '--tableColor': tableColor }">{{ firstColContent }}</div>
        <div v-for="header, j in Object.keys(content).slice(1)"
          class="text-[20px] flex justify-center items-center border-(--tableColor)"
          :class="{ 'bg-white': !(i % 2 === 0), 'bg-[#A3A1A52E]': i % 2 === 0, 'border-r': (j + 2) % columnAmt != 0 }"
          :style="{ '--tableColor': tableColor }">{{ content[header][i] }}
        </div>
      </template>
    </template>
    <template v-if="content[Object.keys(content)[0]].length < maximum">
      <template
        v-for="i in Array.from({ length: maximum - content[Object.keys(content)[0]].length }, (_, i) => content[Object.keys(content)[0]].length + i)">
        <div class="text-[20px] flex justify-center items-center border-(--tableColor)"
          :class="{ 'bg-white': !(i % 2 === 0), 'bg-[#A3A1A52E]': i % 2 === 0, 'border-r': Object.keys(content).length > 1 }"
          :style="{ '--tableColor': tableColor }">
          &nbsp;</div>
        <div v-for="_, j in Object.keys(content).slice(1)"
          class="text-[20px] flex justify-center items-center border-(--tableColor)"
          :class="{ 'bg-white': !(i % 2 === 0), 'bg-[#A3A1A52E]': i % 2 === 0, 'border-r': (j + 2) % columnAmt != 0 }"
          :style="{ '--tableColor': tableColor }">&nbsp;</div>
      </template>
    </template>
  </div>
</template>

<style scoped></style>
