<script setup lang="ts">
import { useBranches } from '@/composables/useBranch';
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  "defaultValue": {
    type: String,
    required: false
  },
});
const emit = defineEmits(["curSelected"]);

const curSelected = ref(props.defaultValue === undefined ? "" : props.defaultValue);
const { branches, isLoading, error, fetchBranches } = useBranches();

watch(curSelected, (newCurSelected) => emit("curSelected", newCurSelected));

onMounted(() => {
  fetchBranches();
});
</script>

<template>
  <div>
    <select class="h-full border-[#EF2D56] text-[#EF2D56] text-[23px] font-bold border-4 text-center"
      v-model="curSelected">
      <option v-if="defaultValue === undefined" value="">Choose a branch</option>
      <template v-if="!isLoading">
        <option v-for="branch in branches" :key="branch._id" :value="branch._id">{{ `${branch.name.toUpperCase()}` }}
        </option>
      </template>
    </select>
  </div>
</template>

<style scoped></style>
