<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useThreeStore } from '../stores/three'

const three = useThreeStore()
const { selectedObject, objects } = storeToRefs(three)

function openDialog() {
    windowAPI.openDialog()
}
</script>

<template>
    <div
        class="absolute right-0 top-0 bg-black p-1 flex flex-col justify-center align-middle items-center text-white gap-y-2"
    >
        <div class="bg-gray-500 w-full h-full rounded-sm flex flex-col gap-y-2 p-1">
            <div
                v-if="objects?.length > 0"
                v-for="object of objects"
                :key="object.uuid"
                class="w-full rounded-xl flex"
            >
                <p
                    class="ml-4 cursor-pointer hover:bg-gray-800 rounded-xl p-1"
                    @click="selectedObject = object"
                >
                    > {{ object.name }}
                </p>
            </div>
        </div>
        <div>
            <button
                @click="openDialog"
                class="rounded-2xl cursor-pointer p-2 hover:text-black hover:bg-white"
            >
                Add GLB
            </button>

            <div v-if="selectedObject" class="flex flex-col gap-2">
                <div class="bg-[#141414] p-1 px-2 rounded-2xl focus:border-0">
                    x: <input v-model="selectedObject.position.x" />
                </div>
                <div class="bg-[#141414] p-1 px-2 rounded-2xl">
                    y: <input v-model="selectedObject.position.y" />
                </div>
                <div class="bg-[#141414] p-1 px-2 rounded-2xl">
                    z: <input v-model="selectedObject.position.z" />
                </div>
            </div>

            <div>
                <button @click="three.convertToJson">Convert scene to JSON</button>
            </div>
        </div>
    </div>
</template>
