<script setup lang="ts">
import search from '../assets/search.png'
import imgPlaceholder from '../assets/image.png'
</script>

<template>
  <div class="grid grid-cols-[1fr_4fr] grid-rows-2 gap-x-9.25 gap-y-15.25 px-11.25 py-11.5 h-full">
    <div class="bg-white rounded-[25px] overflow-hidden">
      <div class="bg-[#EF2D56] flex justify-center items-center px-14 py-3">
        <h1 class="font-bold text-[25px] whitespace-nowrap">Low Stocks</h1>
      </div>
      <div class="px-4.75 py-5">
        <div class="flex items-center">
          <div class="w-6.25 h-6.25 bg-red-600 rounded-[50%]"></div>
          <p class="text-[30px] whitespace-nowrap ml-3.75">Stock Name</p>
        </div>
        <div class="text-[20px]">Branch Name</div>
      </div>
      <div class="px-4.75 py-5">
        <div class="flex items-center">
          <div class="w-6.25 h-6.25 bg-red-600 rounded-[50%]"></div>
          <p class="text-[30px] whitespace-nowrap ml-3.75">Stock Name</p>
        </div>
        <div class="text-[20px]">Branch Name</div>
      </div>
      <div class="px-4.75 py-5">
        <div class="flex items-center">
          <div class="w-6.25 h-6.25 bg-red-600 rounded-[50%]"></div>
          <p class="text-[30px] whitespace-nowrap ml-3.75">Stock Name</p>
        </div>
        <div class="text-[20px]">Branch Name</div>
      </div>
    </div>
    <div class="bg-white row-span-2 rounded-[25px] overflow-hidden px-7.5 py-4.5">
      <div class="flex mb-12.75 justify-between">
        <div class="bg-[#363537] px-3.25 py-1.5 rounded-[15px] flex">
          <input
            class="placeholder:text-white placeholder:text-[23px] bg-[#5B5A5E80] rounded-[10px] pl-3 caret-white text-white mr-1.5 h-full w-[320px]"
            type="text" placeholder="Search stock...">
          <button class="shrink-0 bg-[#5B5A5E80] rounded-[10px] px-2 py-1">
            <img class="w-9.5 h-9.5" :src="search" alt="stock search button">
          </button>
        </div>
        <div class="flex">
          <div>
            <select class="h-full border-[#EF2D56] text-[#EF2D56] text-[23px] font-bold border-4 text-center"
              name="branches">
              <option value="house">HOUSE</option>
              <option value="ccmc">CCMC</option>
              <option value="perpetual">PERPETUAL</option>
            </select>
          </div>
          <div class="flex items-center px-3.5">
            <div class="w-7.5 h-7.5 bg-red-600 rounded-[50%]"></div>
            <p class="text-[23px] ml-2.75">Low</p>
          </div>
          <button class="bg-[#DCED31] px-3.5 py-3.75 rounded-[20px] text-[23px]">Apply</button>
        </div>
      </div>
      <div class="grid grid-cols-[200px_200px_200px_200px] mb-6.25 gap-x-9.25 gap-y-15 justify-center">
        <div class="bg-[#0CCE6B] px-3.75 py-5 rounded-[25px]">
          <img :src="imgPlaceholder" alt="placholder image">
          <div class="flex mt-2.5">
            <p class="text-[19px]">Stock<br>Name</p>
            <div class="flex ml-auto items-center">
              <div class="w-6.25 h-6.25 bg-red-600 rounded-[50%] mr-2.75"></div>
              <p class="text-[19px]">Low</p>
            </div>
          </div>
        </div>
        <div class="bg-[#0CCE6B] px-3.75 py-5 rounded-[25px]">
          <img :src="imgPlaceholder" alt="placholder image">
          <div class="flex mt-2.5">
            <p class="text-[19px]">Stock<br>Name</p>
            <div class="flex ml-auto items-center">
              <div class="w-6.25 h-6.25 bg-red-600 rounded-[50%] mr-2.75"></div>
              <p class="text-[19px]">Low</p>
            </div>
          </div>
        </div>
        <div class="bg-[#0CCE6B] px-3.75 py-5 rounded-[25px]">
          <img :src="imgPlaceholder" alt="placholder image">
          <div class="flex mt-2.5">
            <p class="text-[19px]">Stock<br>Name</p>
            <div class="flex ml-auto items-center">
              <div class="w-6.25 h-6.25 bg-red-600 rounded-[50%] mr-2.75"></div>
              <p class="text-[19px]">Low</p>
            </div>
          </div>
        </div>
        <div class="bg-[#0CCE6B] px-3.75 py-5 rounded-[25px]">
          <img :src="imgPlaceholder" alt="placholder image">
          <div class="flex mt-2.5">
            <p class="text-[19px]">Stock<br>Name</p>
            <div class="flex ml-auto items-center">
              <div class="w-6.25 h-6.25 bg-red-600 rounded-[50%] mr-2.75"></div>
              <p class="text-[19px]">Low</p>
            </div>
          </div>
        </div>
        <div class="bg-[#0CCE6B] px-3.75 py-5 rounded-[25px]">
          <img :src="imgPlaceholder" alt="placholder image">
          <div class="flex mt-2.5">
            <p class="text-[19px]">Stock<br>Name</p>
            <div class="flex ml-auto items-center">
              <div class="w-6.25 h-6.25 bg-red-600 rounded-[50%] mr-2.75"></div>
              <p class="text-[19px]">Low</p>
            </div>
          </div>
        </div>
        <div class="bg-[#0CCE6B] px-3.75 py-5 rounded-[25px]">
          <img :src="imgPlaceholder" alt="placholder image">
          <div class="flex mt-2.5">
            <p class="text-[19px]">Stock<br>Name</p>
            <div class="flex ml-auto items-center">
              <div class="w-6.25 h-6.25 bg-red-600 rounded-[50%] mr-2.75"></div>
              <p class="text-[19px]">Low</p>
            </div>
          </div>
        </div>
        <div class="bg-[#0CCE6B] px-3.75 py-5 rounded-[25px]">
          <img :src="imgPlaceholder" alt="placholder image">
          <div class="flex mt-2.5">
            <p class="text-[19px]">Stock<br>Name</p>
            <div class="flex ml-auto items-center">
              <div class="w-6.25 h-6.25 bg-red-600 rounded-[50%] mr-2.75"></div>
              <p class="text-[19px]">Low</p>
            </div>
          </div>
        </div>
        <div class="bg-[#0CCE6B] px-3.75 py-5 rounded-[25px]">
          <img :src="imgPlaceholder" alt="placholder image">
          <div class="flex mt-2.5">
            <p class="text-[19px]">Stock<br>Name</p>
            <div class="flex ml-auto items-center">
              <div class="w-6.25 h-6.25 bg-red-600 rounded-[50%] mr-2.75"></div>
              <p class="text-[19px]">Low</p>
            </div>
          </div>
        </div>
      </div>
      <div class="flex gap-5.25 justify-center">
        <button class="bg-[#ED7D3A] text-white w-12.5 h-13.25 text-[23px] rounded-[10px]">&lt;</button>
        <button class="bg-[#ED7D3A] text-white w-12.5 h-13.25 text-[23px] rounded-[10px]">1</button>
        <button class="bg-[#ED7D3A] text-white w-12.5 h-13.25 text-[23px] rounded-[10px]">2</button>
        <button class="bg-[#ED7D3A] text-white w-12.5 h-13.25 text-[23px] rounded-[10px]">3</button>
        <button class="bg-[#ED7D3A] text-white w-12.5 h-13.25 text-[23px] rounded-[10px]">4</button>
        <button class="bg-[#ED7D3A] text-white w-12.5 h-13.25 text-[23px] rounded-[10px]">5</button>
        <button class="bg-[#ED7D3A] text-white w-12.5 h-13.25 text-[23px] rounded-[10px]">&gt;</button>
      </div>
    </div>
    <div class="bg-white rounded-[25px] overflow-hidden">
      <div class="bg-[#ED7D3A] flex justify-center items-center px-14 py-3">
        <h1 class="font-bold text-[25px] whitespace-nowrap">Delivery Status</h1>
      </div>
      <div class="px-7.25 py-4.25">
        <div>
          <h1 class="text-[30px] whitespace-nowrap">Branch Name</h1>
        </div>
        <div class="text-[20px]">Delivery Status</div>
      </div>
      <div class="px-7.25 py-4.25">
        <div>
          <h1 class="text-[30px] whitespace-nowrap">Branch Name</h1>
        </div>
        <div class="text-[20px]">Delivery Status</div>
      </div>
      <div class="px-7.25 py-4.25">
        <div>
          <h1 class="text-[30px] whitespace-nowrap">Branch Name</h1>
        </div>
        <div class="text-[20px]">Delivery Status</div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
