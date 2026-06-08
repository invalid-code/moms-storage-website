<script setup lang="ts">
import { ref, onMounted } from 'vue'

const branches = ref(null);
const error = ref("");
const isLoading = ref(true);
const emit = defineEmits(["curSelected"]);

const getAllBranches = async () => {
  try {
    const response = await fetch(`http://localhost:5000/api/branch`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    branches.value = await response.json();
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = `An unexpected error occurred: ${err}`;
    }
  } finally {
    isLoading.value = false;
  }
}

const changeSelected = (event: Event) => {
    const selectedVal = event.target.value;
    emit("curSelected", selectedVal);
}

onMounted(() => {
  getAllBranches();
});
</script>

<template>
  <div>
    <select class="h-full border-[#EF2D56] text-[#EF2D56] text-[23px] font-bold border-4 text-center" name="branches" @change="changeSelected">
      <template v-if="!isLoading">
        <option v-for="branch in branches" :value="branch._id">{{ `${branch.name.toUpperCase()}` }}</option>
      </template>
    </select>
  </div>
</template>

<style scoped></style>
