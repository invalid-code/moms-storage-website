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
      <template v-if="interactiveHeaders?.includes(key)">
        <slot :name="`headers-${key }`"></slot>
      </template>
      <template v-else>{{ key }}</template>
    </div>
    <template v-for="(firstColContent, i) in content[Object.keys(content)[0]]">
      <template v-if="typeof i === 'string'"></template>
      <template v-else>
        <template v-if="i % 2 === 0">
          <template v-if="interactiveColumns.includes(Object.keys(content)[0])">
            <div class="bg-[#A3A1A52E] text-[25px] flex justify-center items-center">
              <slot :name="`row-${i}`"></slot>
            </div>
          </template>
          <template v-else>
            <div class="bg-[#A3A1A52E] text-[25px] flex justify-center items-center">{{ firstColContent }}</div>
          </template>
          <template v-for="header in Object.keys(content).slice(1)">
            <template v-if="interactiveColumns.includes(header)">
              <div class="bg-[#A3A1A52E] text-[25px] flex justify-center items-center">
                <slot :name="`row-${i}`"></slot>
              </div>
            </template>
            <template v-else>
              <div class="bg-[#A3A1A52E] text-[25px] flex justify-center items-center">{{ content[header][i] }}</div>
            </template>
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
  </div>
  <!-- <div class="px-29.5 py-16.75 h-full"> -->
  <!-- <div class="grid grid-cols-3 rounded-[20px] overflow-hidden h-full">
      <div class="bg-[#0CCE6B] font-bold flex justify-center items-center text-[25px]">Stock Name</div>
      <div class="bg-[#0CCE6B] flex justify-center items-center text-[25px]">
        <select class="font-bold" name="" id="">
          <option value="house">HOUSE</option>
          <option value="ccmc">CCMC</option>
          <option value="perpetual">PERPETUAL</option>
        </select>
      </div>
      <div class="bg-[#0CCE6B] font-bold flex justify-center items-center text-[25px]">Quantity</div>
      <div class="bg-white flex justify-center items-center text-[25px]">Stock Name</div>
      <div class="bg-white flex justify-center items-center text-[25px]">
        <select name="" id="">
          <option value="">HOUSES</option>
          <option value="">CCMC</option>
          <option value="">PERPETUAL</option>
        </select>
      </div>
      <div class="bg-white flex justify-center items-center text-[25px]">Quantity</div>
      <div class="bg-[#A3A1A52E] flex justify-center items-center text-[25px]">Stock Name</div>
      <div class="bg-[#A3A1A52E] flex justify-center items-center text-[25px]">
        <select name="" id="">
          <option value="">HOUSES</option>
          <option value="">CCMC</option>
          <option value="">PERPETUAL</option>
        </select>
      </div>
      <div class="bg-[#A3A1A52E] flex justify-center items-center text-[25px]">Quantity</div>
      <div class="bg-white flex justify-center items-center text-[25px]">Stock Name</div>
      <div class="bg-white flex justify-center items-center text-[25px]">
        <select name="" id="">
          <option value="">HOUSES</option>
          <option value="">CCMC</option>
          <option value="">PERPETUAL</option>
        </select>
      </div>
      <div class="bg-white flex justify-center items-center text-[25px]">Quantity</div>
      <div class="bg-[#A3A1A52E] flex justify-center items-center text-[25px]">Stock Name</div>
      <div class="bg-[#A3A1A52E] flex justify-center items-center text-[25px]">
        <select name="" id="">
          <option value="">HOUSES</option>
          <option value="">CCMC</option>
          <option value="">PERPETUAL</option>
        </select>
      </div>
      <div class="bg-[#A3A1A52E] flex justify-center items-center text-[25px]">Quantity</div>
      <div class="bg-white flex justify-center items-center text-[25px]">Stock Name</div>
      <div class="bg-white flex justify-center items-center text-[25px]">
        <select name="" id="">
          <option value="">HOUSES</option>
          <option value="">CCMC</option>
          <option value="">PERPETUAL</option>
        </select>
      </div>
      <div class="bg-white flex justify-center items-center text-[25px]">Quantity</div>
      <div class="bg-[#A3A1A52E] flex justify-center items-center text-[25px]">Stock Name</div>
      <div class="bg-[#A3A1A52E] flex justify-center items-center text-[25px]">
        <select name="" id="">
          <option value="">HOUSES</option>
          <option value="">CCMC</option>
          <option value="">PERPETUAL</option>
        </select>
      </div>
      <div class="bg-[#A3A1A52E] flex justify-center items-center text-[25px]">Quantity</div>
      <div class="bg-white flex justify-center items-center text-[25px]">Stock Name</div>
      <div class="bg-white flex justify-center items-center text-[25px]">
        <select name="" id="">
          <option value="">HOUSES</option>
          <option value="">CCMC</option>
          <option value="">PERPETUAL</option>
        </select>
      </div>
      <div class="bg-white flex justify-center items-center text-[25px]">Quantity</div>
      <div class="bg-[#A3A1A52E] flex justify-center items-center text-[25px]">Stock Name</div>
      <div class="bg-[#A3A1A52E] flex justify-center items-center text-[25px]">
        <select name="" id="">
          <option value="">HOUSES</option>
          <option value="">CCMC</option>
          <option value="">PERPETUAL</option>
        </select>
      </div>
      <div class="bg-[#A3A1A52E] flex justify-center items-center text-[25px]">Quantity</div>
      <div class="bg-white flex justify-center items-center text-[25px]">Stock Name</div>
      <div class="bg-white flex justify-center items-center text-[25px]">
        <select name="" id="">
          <option value="">HOUSES</option>
          <option value="">CCMC</option>
          <option value="">PERPETUAL</option>
        </select>
      </div>
      <div class="bg-white flex justify-center items-center text-[25px]">Quantity</div>
      <div class="bg-[#A3A1A52E] flex justify-center items-center text-[25px]">Stock Name</div>
      <div class="bg-[#A3A1A52E] flex justify-center items-center text-[25px]">
        <select name="" id="">
          <option value="">HOUSES</option>
          <option value="">CCMC</option>
          <option value="">PERPETUAL</option>
        </select>
      </div>
      <div class="bg-[#A3A1A52E] flex justify-center items-center text-[25px]">Quantity</div>
    </div> -->
  <!-- </div> -->
</template>

<style scoped></style>
