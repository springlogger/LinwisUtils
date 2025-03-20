<script setup lang="ts">
import { useEventListener } from '@vueuse/core';
import { ref } from 'vue';
import { useEditorStore } from '../stores/editor';
import { storeToRefs } from 'pinia';

const leftSidebar = ref<HTMLDivElement>();
const leftSidebarWidth = ref<number>(undefined);

const editor = useEditorStore();
const { editorContainer } = storeToRefs(editor);

async function startResizing (event: MouseEvent) {

    if (!leftSidebarWidth.value) {
        leftSidebarWidth.value = leftSidebar.value.offsetWidth;
    }

    const startX = event.clientX
    const startWidth = leftSidebarWidth.value

    const onMouseMove = (moveEvent: MouseEvent) => {
        const newWidth = startWidth + (moveEvent.clientX - startX)

        // вместо 300 нужно брать стартовое значение
        leftSidebarWidth.value = Math.min(Math.max(300, newWidth), window.screen.width / 2.5);
    }

    const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
    }

    useEventListener(window, 'mousemove', onMouseMove);
    useEventListener(window, 'mouseup', onMouseUp);
}

</script>

<template>
    <div class="w-full h-screen flex flex-row jetbrains-mono-code text-white">
        <div ref="leftSidebar" class="h-screen bg-[#1f1f1f] flex flex-row justify-center relative p-6" 
        :style="{ width: leftSidebarWidth !== undefined ? `${leftSidebarWidth}px` : '20%' }"
        >
            <div class="flex flex-col justify-between items-center py-10">
                <div class="flex flex-col gap-y-10">
                    <div>
                        <input placeholder="Search..." class="bg-[#141414] p-2 rounded-2xl" />
                    </div>
                    <nav class="flex flex-col gap-y-3">
                        <a>Daily notes</a>
                        <a>All notes</a>
                        <a class="opacity-40">+ New Category</a>
                    </nav>

                    <div>
                        <p>Tree Notes</p>
                        <div class="pl-5 mt-2">
                            <button class="opacity-40">+ New note</button>
                        </div>
                    </div>
                    <div>
                        <p>Pinned Notes</p>
                    </div>
                </div>
                <div>
                    Another Options
                </div>
            </div>

            <div @mousedown.prevent="startResizing" class="w-fit h-screen absolute right-0 cursor-ew-resize p-[1px]">
            </div>
        </div>
        <div class="w-full h-screen bg-[#141414] ">
            <div ref="editorContainer" class="w-full h-screen whitespace-pre-wrap p-2 focus:outline-none"></div>
        </div>
        <div class="w-1/5 h-screen bg-[#1f1f1f]">
            <div>
                Calendar
            </div>
            <div>
                <h2>Note actions</h2>
                <div>
                    <p>Pin note</p>
                    <p>Share</p>
                    <p>Show history</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>