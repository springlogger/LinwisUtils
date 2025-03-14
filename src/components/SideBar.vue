<script setup lang="ts">
import { useUserStore } from '../stores/user';
import { ref } from 'vue';

const selectedPage = defineModel('selectedPage');

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

</script>

<template>
    <div 
        @mouseenter="mouseEnter" 
        @mouseleave="mouseLeave" 
        class="p-2 w-14 lg:w-20 bg-black h-screen text-white jetbrains-mono-code transition-all ease-in-out delay-[`${delay}`] hover:w-48 lg:hover:w-80 duration-300 "
        :class="{
            'absolute left-0': selectedPage === 'Editor'
        }"
    >
        <div class="m-1 h-full flex flex-col justify-between">
            
            <div @click="user.isUserAuthorized = true" class="mt-5 cursor-pointer bg-gray-50 rounded-2xl p-2 text-black text-center hover:bg-gray-200">
                <i class="fa-solid fa-user"></i> {{ isMouseOverSideBar === true ? "Profile" : '' }}
            </div>

            <nav class="h-32 flex flex-col items-center justify-between">
                <div 
                    @click="selectedPage = 'Editor'" 
                    class="flex  items-center px-2 w-full p-1 text-center rounded-2xl cursor-pointer hover:bg-white hover:text-black"
                    :class="{
                        'bg-gray-200' : selectedPage === 'Editor',
                        'text-black' : selectedPage === 'Editor',
                    }"
                >
                    <i class="fa-solid fa-cube mr-2"></i> 
                    <p>{{ isMouseOverSideBar === true ? "Editor" : '' }}</p>
                </div>
                <div 
                    @click="selectedPage = 'Notes'" 
                    class="flex  items-center px-2 w-full p-1 text-center rounded-2xl cursor-pointer hover:bg-white hover:text-black"
                    :class="{
                        'bg-gray-200' : selectedPage === 'Notes',
                        'text-black' : selectedPage === 'Notes',
                    }"
                >
                    <i class="fa-solid fa-comment mr-2"></i> 
                    <p>{{ isMouseOverSideBar === true ? "Notes" : '' }}</p>
                </div>
                <div 
                    @click="selectedPage = 'Settings'" 
                    class="flex items-center px-2 w-full mt-2 p-1 text-center rounded-2xl cursor-pointer hover:bg-white hover:text-black"
                    :class="{
                        'bg-gray-200' : selectedPage === 'Settings',
                        'text-black' : selectedPage === 'Settings',
                    }"
                >
                    <i class="fa-solid fa-gear mr-2"></i>
                    <p>{{ isMouseOverSideBar === true ? "Settings" : '' }}</p>
                </div>
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