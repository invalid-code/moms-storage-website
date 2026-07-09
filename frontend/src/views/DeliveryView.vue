<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import InteractiveTable from '@/components/InteractiveTable.vue';

const route = useRoute();

const deliveryId = computed(() => route.params.id);
</script>

<template>
  hello
</template>

<style scoped></style>
