<script setup lang="ts">
import { useUserStore } from '../stores/user';
import { ref } from 'vue';

const user = useUserStore();
const isMouseOverSideBar = ref(false);

const delay = 100;
let mouseOverTimeout: NodeJS.Timeout | undefined = undefined;

function mouseEnter() {
    if (mouseOverTimeout) {
        clearTimeout(mouseOverTimeout)
    }

    mouseOverTimeout = setTimeout(() => {
        isMouseOverSideBar.value = true;
    }, delay + 10)
}

function mouseLeave() {
    if (mouseOverTimeout) {
        clearTimeout(mouseOverTimeout)
    }

    isMouseOverSideBar.value = false;
}

function openDialog() {
  windowAPI.openDialog();
}

</script>

<template>
    <div @mouseenter="mouseEnter" @mouseleave="mouseLeave" class="absolute left-0 p-2 w-14 lg:w-20 bg-black h-screen text-white jetbrains-mono-code transition-all ease-in-out delay-[`${delay}`] hover:w-48 lg:hover:w-80 duration-300 ">
        <div class="m-1 h-full flex flex-col justify-between">
            
            <div @click="user.isUserAuthorized = true" class="mt-5 cursor-pointer bg-gray-50 rounded-2xl p-2 text-black text-center hover:bg-gray-200">
                <i class="fa-solid fa-user"></i> {{ isMouseOverSideBar === true ? "Profile" : '' }}
            </div>

            <nav class="h-32 flex flex-col items-center justify-between">
                <a @click="openDialog" class="w-full p-1 text-center rounded-2xl cursor-pointer hover:bg-white hover:text-black"><i class="fa-solid fa-cube"></i> {{ isMouseOverSideBar === true ? "Select GLB" : '' }}</a>
                <a @click="" class="w-full p-1 text-center rounded-2xl cursor-pointer hover:bg-white hover:text-black">2 {{ isMouseOverSideBar === true ? "Test 2" : '' }}</a>
                <a @click="" class="w-full p-1 text-center rounded-2xl cursor-pointer hover:bg-white hover:text-black">3 {{ isMouseOverSideBar === true ? "Test 3" : '' }}</a>
            </nav>

            <button @click="user.isUserAuthorized = false" class="mb-5 w-full p-1 text-center rounded-2xl cursor-pointer hover:bg-white hover:text-black">
                {{ user.isUserAuthorized ? 
                    isMouseOverSideBar === true ? "Log out " : ''
                 : '' 
                }}
                
                <i v-if="user.isUserAuthorized" class="fa-solid fa-right-from-bracket"></i> 
            </button>
        </div>
    </div>
</template>