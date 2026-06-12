<script setup lang="ts">
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
  "interactiveHeaders": {
    type: Array,
    required: false
  },
});
</script>

<template>
  <div class="grid rounded-[20px] overflow-hidden h-full">
    <div class="text-[25px] font-bold flex justify-center items-center" :class="`bg-[#${tableColor}]`"
      v-for="key in Object.keys(content)">
      <slot v-if="interactiveHeaders?.includes(key)" :name="`headers-${key}`"></slot>
      <template v-else>{{ key }}</template>
    </div>
    <template v-for="(firstColContent, i) in content[Object.keys(content)[0]]">
      <template v-if="typeof i === 'string'"></template>
      <template v-else>
        <template v-if="i % 2 === 0">
          <div v-if="interactiveColumns.includes(Object.keys(content)[0])"
            class="bg-[#A3A1A52E] text-[25px] flex justify-center items-center">
            <slot :name="`row-${i}`"></slot>
          </div>
          <div v-else class="bg-[#A3A1A52E] text-[25px] flex justify-center items-center">{{ firstColContent }}</div>
          <template v-for="header in Object.keys(content).slice(1)">
            <div v-if="interactiveColumns.includes(header)"
              class="bg-[#A3A1A52E] text-[25px] flex justify-center items-center">
              <slot :name="`row-${i}`"></slot>
            </div>
            <div v-else class="bg-[#A3A1A52E] text-[25px] flex justify-center items-center">{{ content[header][i] }}
            </div>
          </template>
        </template>
        <template v-else>
          <template v-if="interactiveColumns.includes(Object.keys(content)[0])">
            <div class="bg-white text-[25px] flex justify-center items-center">
              <slot :name="`row-${i}`"></slot>
            </div>
          </template>
          <template v-else>
            <div class="bg-white text-[25px] flex justify-center items-center">{{ firstColContent }}</div>
          </template>
          <template v-for="header in Object.keys(content).slice(1)">
            <template v-if="interactiveColumns.includes(header)">
              <div class="bg-white text-[25px] flex justify-center items-center">
                <slot :name="`row-${i}`"></slot>
              </div>
            </template>
            <template v-else>
              <div class="bg-white text-[25px] flex justify-center items-center">{{ content[header][i] }}</div>
            </template>
          </template>
        </template>
      </template>
    </template>
    <template v-if="content[Object.keys(content)[0]].length < 10">
      <template
        v-for="i in Array.from({ length: 10 - content[Object.keys(content)[0]].length }, (_, i) => content[Object.keys(content)[0]].length + i)">
        <template v-for="_ in Object.keys(content)">
          <template v-if="i % 2 == 0">
            <div class="bg-[#A3A1A52E] text-[25px]">&nbsp;</div>
          </template>
          <template v-else>
            <div class="bg-white text-[25px]">&nbsp;</div>
          </template>
        </template>
      </template>
    </template>
  </div>
</template>

<style scoped></style>
