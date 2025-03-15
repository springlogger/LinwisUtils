<script setup lang="ts">
import { useNotesStore } from '../stores/notes';


const notes = useNotesStore();

function addNewNote() {

}

</script>

<template>
    <div class="flex items-center justify-center h-screen jetbrains-mono-code bg-[#141414] text-lg text-white ">
        <div class=" p-2 rounded-2xl w-4/5 h-4/5 flex flex-col">
            <div class="flex flex-row justify-between items-center mt-2">
                <div class="flex flex-row items-center justify-between w-1/2 text-[16px]">
                    <div>
                        All
                    </div>
                    <div>
                        Grouped by status
                    </div>
                    <div>
                        Books
                    </div>
                    <div>
                        Films
                    </div>
                </div>

                <div class="flex flex-row items-center justify-between w-1/4 text-[16px]">
                    <div>
                        Filter
                    </div>
                    <div>
                        Sort
                    </div>
                    <button class="bg-[#F4511E] rounded-lg cursor-pointer p-1">
                        Button
                    </button>
                </div>
            </div>

            <div class="mt-5 flex flex-row text-sm w-1/4 justify-between">
                <div class="opacity-50">
                    Type
                </div>
                <div class="opacity-50">
                    Score
                </div>
                <div class="opacity-50">
                    Add filter
                </div>
            </div>

            <div class="jetbrains-mono-code-bold text-2xl mt-30">
                List
            </div>

            <div>
                <div v-if="notes.notesList.length !== 0" class="mt-10 grid grid-cols-7 gap-y-5">
                    <div class="flex justify-center items-center opacity-50">
                        Name
                    </div>
                    <div class="flex justify-center items-center opacity-50">
                        Type
                    </div>
                    <div class="flex justify-center items-center opacity-50">
                        Status
                    </div>
                    <div class="flex justify-center items-center opacity-50">
                        Score
                    </div>
                    <div class="flex justify-center items-center opacity-50">
                        Author
                    </div>
                    <div class="flex justify-center items-center opacity-50">
                        Completed Time
                    </div>
                    <div class="flex justify-center items-center opacity-50">
                        Link
                    </div>
                    <template v-for="note in notes.notesList">
                        <div class="flex justify-center items-center">
                            {{ note.name }}
                        </div>
                        <div class="flex justify-center items-center">
                            {{ note.type }}
                        </div>
                        <div class="flex justify-center items-center">
                            {{ note.status }}
                        </div>
                        <div class="flex justify-center items-center">
                            {{ note.score }}
                        </div>
                        <div class="flex justify-center items-center">
                            {{ note.author }}
                        </div>
                        <div class="flex justify-center items-center">
                            {{ note.completedTime.toLocaleDateString('ru', {day: 'numeric', month:'short', year:'numeric'}) }}
                        </div>
                        <div class="flex justify-center items-center">
                            {{ note.link }}
                        </div>
                    </template>
                </div>
                <div @click="addNewNote" class="mt-10 hover:bg-white hover:text-black w-fit rounded-2xl px-2 py-1 transition-all ease-linear duration-100 cursor-pointer">
                    + New
                </div>
            </div>
        </div>
    </div>
</template>