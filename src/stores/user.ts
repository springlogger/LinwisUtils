import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
  
    const isUserAuthorized = ref(false);

    async function fetch(email: string, password: string) {
        const response = await windowAPI.api.fetchUser({ email, password });
        console.log(JSON.parse(response));
    }

    return {
        isUserAuthorized,
        fetch
    };
});

// if (import.meta.hot) {
//   import.meta.hot.accept(acceptHMRUpdate(useChatStore, import.meta.hot));
// }
