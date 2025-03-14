<script setup lang="ts">

function openDialog() {
    windowAPI.openDialog();
}

</script>

<template >
    <div class="absolute right-0 top-0 bg-black p-2 flex justify-center align-middle items-center text-white">
        <button @click="openDialog" class="rounded-2xl cursor-pointer p-2 hover:text-black hover:bg-white">Add GLB</button>
    </div>
</template>