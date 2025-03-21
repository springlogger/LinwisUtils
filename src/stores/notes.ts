import { defineStore } from "pinia";
import { ref } from "vue";

export type Note = {
    name: string;
    type: string;
    status: string;
    score: number;
    author: string;
    completedTime?: Date;
    link?: string
}

export const useNotesStore = defineStore("notes", () => {
  
    const notesList = ref<Note[]>([]);
    notesList.value.push({
        name: "test124214",
        type: "test4214",
        status: "test124",
        score: 0,
        author: "test4242",
        completedTime: new Date(),
        link: "tes12t"
    })

    notesList.value.push({
        name: "test",
        type: "test",
        status: "test",
        score: 0,
        author: "test",
        completedTime: new Date(),
        link: "test"
    })

    return {
        notesList
    }
});

// if (import.meta.hot) {
//   import.meta.hot.accept(acceptHMRUpdate(useChatStore, import.meta.hot));
// }
