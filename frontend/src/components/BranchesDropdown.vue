<script setup lang="ts">
const branches = ["HOUSE", "CCMC", "PERPETUAL"];
</script>

<template>
  <div>
    <select class="h-full border-[#EF2D56] text-[#EF2D56] text-[23px] font-bold border-4 text-center" name="branches">
      <option v-for="branch in branches" :value="branch.toLowerCase()">{{ branch }}</option>
    </select>
  </div>
</template>

<style scoped></style>
