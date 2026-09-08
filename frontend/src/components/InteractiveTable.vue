<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';

const target = ref(null);
const targetIsVisible = ref(false);
const scrollContainer = ref(null);

useIntersectionObserver(target, ([{ isIntersecting }]) => {
  targetIsVisible.value = isIntersecting;
}, { root: scrollContainer, threshold: 0.5 });

const props = defineProps({
  "content": {
    type: Object,
    required: true
  },
  "tableColor": {
    type: String,
    required: true
  },
  "interactiveColumns": {
    type: Array,
    required: true
  },
  "RowAmt": {
    type: Number,
    required: true
  },
  "nextPageI": {
    type: Number,
    required: true
  },
  "interactiveHeaders": {
    type: Array,
    required: false
  },
});

const emit = defineEmits(["seen"]);

const everyFirstPage = (el: any) => {
  if (el) {
    target.value = el;
  }
};

const columnAmt = computed(() => Object.keys(props.content).length);

watch(targetIsVisible, (newTargetIsVisible) => {
  if (newTargetIsVisible) {
    emit("seen");
  }
});
</script>

<template>
  <div class="grid rounded-[20px]" ref="scrollContainer">
    <div class="text-[12px] font-bold flex justify-center items-center bg-(--tableColor)"
      :style="{ '--tableColor': tableColor }" v-for="key in Object.keys(content)">
      <slot v-if="interactiveHeaders?.includes(key)" :name="`headers-${key}`"></slot>
      <template v-else>{{ key }}</template>
    </div>
    <template v-for="(_, curRow) in content[Object.keys(content)[0]]">
      <template v-if="typeof curRow === 'string'"></template>
      <template v-else>
        <div v-for="header, i in Object.keys(content)"
          class="text-[12px] flex justify-center items-center border-(--tableColor)"
          :class="{ 'bg-[#A3A1A52E]': curRow % 2 === 0, 'bg-white': !(curRow % 2 === 0), 'border-r': (i + 1) % columnAmt != 0 }"
          :style="{ '--tableColor': tableColor }" :ref="curRow % nextPageI == 0 ? everyFirstPage : undefined">
          <template v-if="interactiveColumns.includes(header)">
            <slot :name="`row-${curRow}`"></slot>
          </template>
          <template v-else>
            {{ content[header][curRow] }}
          </template>
        </div>
      </template>
    </template>
    <template v-if="content[Object.keys(content)[0]].length < RowAmt">
      <template
        v-for="i in Array.from({ length: RowAmt - content[Object.keys(content)[0]].length }, (_, i) => content[Object.keys(content)[0]].length + i)">
        <div v-for="_, j in Object.keys(content)" class="text-[12px] border-(--tableColor)"
          :class="{ 'bg-[#A3A1A52E]': i % 2 === 0, 'bg-white': !(i % 2 === 0), 'border-r': (j + 1) % columnAmt != 0 }"
          :style="{ '--tableColor': tableColor }">&nbsp;</div>
      </template>
    </template>
  </div>
</template>

<style scoped></style>
