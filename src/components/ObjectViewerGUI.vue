<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useThreeStore } from '../stores/three'
import ObjecstThreeView from './ObjecstThreeView.vue'

const three = useThreeStore()
const { selectedObject } = storeToRefs(three)

function openDialog() {
    windowAPI.openDialog()
}
</script>

<template>
    <div
        class="absolute right-0 top-0 bg-black p-1 flex flex-col justify-center align-middle items-center text-white gap-y-2 w-md"
    >
        <div v-if="three.objects.length > 0" class="bg-[#141414] w-full rounded-sm flex flex-col gap-y-2 p-1">
            <table class="w-full table-fixed text-white border-collapse">
                <tbody>
                <ObjecstThreeView
                    v-for="object in three.objects"
                    :key="object.uuid"
                    :object="object"
                    :level="0"
                />
                </tbody>
            </table>
        </div>
        <div class="bg-[#141414] w-full rounded-sm flex flex-col gap-y-2 p-1 py-2">
            <div v-if="selectedObject" class="flex flex-col gap-2">
                <div class="bg-[#1f1f1f] p-1 px-2 rounded-2xl focus:border-0">
                    x: <input v-model="selectedObject.position.x" />
                </div>
                <div class="bg-[#1f1f1f] p-1 px-2 rounded-2xl">
                    y: <input v-model="selectedObject.position.y" />
                </div>
                <div class="bg-[#1f1f1f] p-1 px-2 rounded-2xl">
                    z: <input v-model="selectedObject.position.z" />
                </div>
            </div>

            <button
                @click="openDialog"
                class="rounded-2xl cursor-pointer p-2 hover:text-black hover:bg-white bg-[#343434] transition-all ease-out duration-100"
            >
                Add GLB
            </button>

            <button
                v-if="three.objects.length > 0"
                @click="three.convertToJson"
                class="rounded-2xl cursor-pointer p-2 hover:text-black hover:bg-white bg-[#343434] transition-all ease-out duration-100"
            >
                Convert scene to JSON
            </button>
        </div>
    </div>
</template>
