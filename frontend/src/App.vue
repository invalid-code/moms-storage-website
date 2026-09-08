<script setup lang="ts">
import box from './assets/box.png';
import home from './assets/home.png';
import send from './assets/send.png';
import store from './assets/store.png';
import bell from './assets/bell.png';
import deliveryTruck from './assets/delivery-truck.png';
import { useRoute } from 'vue-router';
import { ref } from 'vue';
import CreateDeliveryModal from './components/CreateDeliveryModal.vue';

const isPopupVisible = ref(false);

const route = useRoute();
</script>

<template>
  <nav class="bg-[#363537] w-full h-12.5 flex items-center p-3.75">
    <h1 class="text-white text-[16px] font-[Roboto]">JRJ PHARMACY</h1>
    <router-link to="/sales" class="ml-auto mr-3.25 text-white text-[14px] font-bold"
      :class="{ 'underline': route.name === 'sales' || route.name === 'sale' }">
      POS
    </router-link>
    <button class="mr-3.25" @click="isPopupVisible = true">
      <img class="h-5.25" :src="deliveryTruck" alt="navbar new delivery">
    </button>
    <img class="h-5.25" :src="bell" alt="navbar notifications">
  </nav>

  <CreateDeliveryModal :isOpen="isPopupVisible" @close="isPopupVisible = false" />

  <div class="flex flex-col h-[calc(100vh-50px)]">
    <main class="bg-[#F5F5F5] flex-1 h-full">
      <router-view />
    </main>
    <aside class="flex justify-around bg-[#363537] w-full h-12.5">
      <router-link to="/" class="flex items-center justify-center" :class="{ 'bg-[#80808080]': route.name === 'home' }">
        <img class="w-5.25 h-5.25" :src="home" alt="sidebar home">
      </router-link>
      <router-link to="/branches" class="flex items-center justify-center"
        :class="{ 'bg-[#80808080]': route.name === 'branches' }">
        <img class="w-5.25 h-5.25" :src="store" alt="sidebar branches">
      </router-link>
      <router-link to="/stocks" class="flex items-center justify-center"
        :class="{ 'bg-[#80808080]': route.name === 'stocks' }">
        <img class="w-5.25 h-5.25" :src="box" alt="sidebar stocks">
      </router-link>
      <router-link to="/deliveries" class="flex items-center justify-center"
        :class="{ 'bg-[#80808080]': route.name === 'deliveries' }">
        <img class="w-5.25 h-5.25" :src="send" alt="sidebar deliveries">
      </router-link>
    </aside>
  </div>
</template>

<style scoped></style>
