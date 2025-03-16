import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
  
    const isUserAuthorized = ref(false);

    async function login(email: string, password: string) {
        const response = await windowAPI.api.fetchUser({ email, password });
        return response
    }

    async function register(name: string, email: string, password: string) {
        const response = await windowAPI.api.register({ name, email, password });
        return response
    }

    return {
        isUserAuthorized,
        login,
        register
    };
});

// if (import.meta.hot) {
//   import.meta.hot.accept(acceptHMRUpdate(useChatStore, import.meta.hot));
// }
