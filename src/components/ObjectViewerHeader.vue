<script setup lang="ts">
import { useThreeStore } from '../stores/three'

const three = useThreeStore()
</script>

<template>
    <div class="bg-[#141414] flex justify-center">
        <div class="flex w-1/3 text-white justify-center p-1">
            <button @click="three.addCube" class=" p-1 cursor-pointer hover:bg-white hover:text-black transition-all duration-100 ease-linear rounded-xl">Add cube</button>
        </div>
    </div>
</template>
