<script setup lang="ts">
import { useUserStore } from '../stores/user';
import { ref } from 'vue';
import LeaveLeft from '../assets/svgs/LeaveLeft.vue';

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

function testUser() {
    user.isUserAuthorized = true;

    user.fetch("123", "321");
}

</script>

<template>
    <div 
        @mouseenter="mouseEnter" 
        @mouseleave="mouseLeave" 
        class="p-2 w-14 lg:w-20 bg-[#000002] h-screen text-[#f9ffff] jetbrains-mono-code transition-all ease-in-out delay-[`${delay}`] hover:w-48 lg:hover:w-80 duration-300 "
        :class="{
            'absolute left-0': selectedPage === 'Editor'
        }"
    >
        <div class="m-1 h-full flex flex-col justify-between">

            <div>
                <!-- <h1 class="flex justify-center text-2xl jetbrains-mono-code-bold bg-gradient-to-r from-[#f29871] to-[#ff4d4d] bg-clip-text text-transparent">Linwis Utils</h1> -->
                <div @click="testUser" class="mt-5 cursor-pointer bg-gray-50 rounded-2xl p-2 text-black text-center hover:bg-gray-200">
                    <i class="fa-solid fa-user"></i> {{ isMouseOverSideBar === true ? "Profile" : '' }}
                </div>
            </div>

            <nav class="h-32 flex flex-col items-center justify-between">
                <div 
                    v-for="page in ['Editor', 'Notes', 'Settings']"
                    @click="selectedPage = page" 
                    class="flex items-center px-2 w-full p-1 text-center rounded-2xl cursor-pointer hover:bg-white hover:text-black"
                    :class="{
                        'bg-gray-200 text-black': selectedPage === page,
                        'justify-center': isMouseOverSideBar === false
                        
                    }"
                >
                    <i class="fa-solid" 
                        :class="{
                            'fa-cube': page === 'Editor',
                            'fa-comment': page === 'Notes',
                            'fa-gear': page === 'Settings',
                            'mr-2': isMouseOverSideBar === true
                        }"
                    >
                    </i> 
                    <p>{{ isMouseOverSideBar === true ? page : '' }}</p>
                </div>
            </nav>

            <button 
                @click="user.isUserAuthorized = false" 
                class="flex flex-row justify-center items-center mb-5 w-full rounded-2xl"
                :class="{
                    'p-1 cursor-pointer hover:bg-white hover:text-black': user.isUserAuthorized === true
                }"
            >
                <LeaveLeft 
                    v-if="user.isUserAuthorized"
                    class="w-4 h-4"
                    :class="{
                        'mr-4': isMouseOverSideBar === true
                    }" 
                />

                {{ user.isUserAuthorized ? 
                    isMouseOverSideBar === true ? "Log out " : ''
                 : '' 
                }}
            </button>
        </div>
    </div>
</template>