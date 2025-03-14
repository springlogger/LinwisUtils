import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
  
    const isUserAuthorized = ref(false);

    return {
        isUserAuthorized
    };
});

// if (import.meta.hot) {
//   import.meta.hot.accept(acceptHMRUpdate(useChatStore, import.meta.hot));
// }
