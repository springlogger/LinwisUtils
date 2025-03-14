<script setup lang="ts">
import { Object3D } from 'three';

const selectedObject = defineModel<Object3D | undefined>('selectedObject')

function openDialog() {
    windowAPI.openDialog();
}

</script>

<template >
    <div class="absolute right-0 top-0 bg-black p-2 flex justify-center align-middle items-center text-white">
        <button @click="openDialog" class="rounded-2xl cursor-pointer p-2 hover:text-black hover:bg-white">Add GLB</button>

        <div v-if="selectedObject">
            x: {{ selectedObject.position.x.toFixed(3) }}
            y: {{ selectedObject.position.y.toFixed(3) }}
            z: {{ selectedObject.position.z.toFixed(3) }}
        </div>
    </div>
</template>