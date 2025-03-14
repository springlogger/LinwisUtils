<script setup lang="ts">
import { ref } from 'vue';
import isUserAuthorized from '../stores/user'

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

</script>

<template>
    <div @mouseenter="mouseEnter" @mouseleave="mouseLeave" class="absolute left-0 p-2 w-14 lg:w-20 bg-black h-screen text-white jetbrains-mono-code transition-all ease-in-out delay-[`${delay}`] hover:w-48 lg:hover:w-80 duration-300 ">
        <div class="m-1 h-full flex flex-col justify-between">
            
            <div class="mt-5 bg-gray-50 rounded-2xl p-2 text-black text-center">
                <i class="fa-solid fa-user"></i> {{ isMouseOverSideBar === true ? "Profile" : '' }}
            </div>

            <nav class="h-32 flex flex-col items-center justify-between">
                <a>1 {{ isMouseOverSideBar === true ? "Test 1" : '' }}</a>
                <a>2 {{ isMouseOverSideBar === true ? "Test 2" : '' }}</a>
                <a>3 {{ isMouseOverSideBar === true ? "Test 3" : '' }}</a>
            </nav>

            <button v-if="isUserAuthorized" class="mb-5 w-full flex justify-center">{{ isMouseOverSideBar === true ? "Log out" : '' }} <i class="fa-solid fa-right-from-bracket"></i> </button>
        </div>
    </div>
</template>